// server.js - Backend con sistema giacenze per settimana
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 7070;
const JWT_SECRET = process.env.JWT_SECRET || 'giacenze-default-secret-key-molto-lunga-per-sicurezza-2024';

app.use(cors());
app.use(express.json());

const corsOptions = {
  origin: [
    'http://localhost:3000', // Development
    'https://resourceful-serenity-production.up.railway.app' // Production
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Connessione MongoDB
const MONGODB_URI = process.env.MONGODB_URI
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schema aggiornati
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descrizione: String,
  unita: { type: String, default: 'pz' },
  categoria: String,
  attivo: { type: Boolean, default: true }
}, { timestamps: true });

const poloSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descrizione: String,
  attivo: { type: Boolean, default: true }
}, { timestamps: true });

const mezzoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descrizione: String,
  attivo: { type: Boolean, default: true }
}, { timestamps: true });

const settimanaSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  anno: { type: Number, required: true },
  dataInizio: { type: Date, required: true },
  dataFine: { type: Date, required: true },
  attiva: { type: Boolean, default: true }
}, { timestamps: true });

const assegnazioneSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Polo', required: true },
  mezzoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mezzo', required: true },
  settimanaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settimana', required: true },
  attiva: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// MODIFICATO: Schema giacenze con riferimento alla settimana
const giacenzaUtenteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  settimanaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settimana' }, // NUOVO: riferimento settimana
  quantitaAssegnata: { type: Number, required: true, default: 0 },
  quantitaDisponibile: { type: Number, required: true, default: 0 },
  quantitaMinima: { type: Number, required: true, default: 0 },
  dataAssegnazione: { type: Date, default: Date.now },
  assegnatoDa: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  attiva: { type: Boolean, default: true },
  // NUOVO: flag per giacenza globale (vale per tutte le settimane)
  isGlobale: { type: Boolean, default: true }
}, { timestamps: true });

const utilizzoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  giacenzaUtenteId: { type: mongoose.Schema.Types.ObjectId, ref: 'GiacenzaUtente', required: true },
  assegnazioneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assegnazione' },
  quantitaUtilizzata: { type: Number, required: true },
  quantitaPrimaDellUso: Number,
  quantitaRimasta: Number,
  dataUtilizzo: { type: Date, default: Date.now },
  settimanaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settimana' },
  poloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Polo' },
  mezzoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mezzo' },
  note: { type: String, default: '' }  // ← AGGIUNTO QUESTO CAMPO
}, { timestamps: true });

const aggiuntaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  giacenzaUtenteId: { type: mongoose.Schema.Types.ObjectId, ref: 'GiacenzaUtente', required: true },
  assegnazioneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assegnazione' },
  quantitaAggiunta: { type: Number, required: true },
  quantitaPrimaDellUso: Number,
  quantitaRimasta: Number,
  dataUtilizzo: { type: Date, default: Date.now },
  settimanaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settimana' },
  poloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Polo' },
  mezzoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mezzo' }
}, { timestamps: true });

// Schema ricariche
const ricaricaGiacenzaSchema = new mongoose.Schema({
  giacenzaUtenteId: { type: mongoose.Schema.Types.ObjectId, ref: 'GiacenzaUtente', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantitaPrecedente: { type: Number, required: true },
  quantitaAggiunta: { type: Number, required: true },
  quantitaNuova: { type: Number, required: true },
  motivazione: { type: String, default: 'Ricarica manuale' },
  dataRicarica: { type: Date, default: Date.now },
  eseguitoDa: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Modelli
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Polo = mongoose.model('Polo', poloSchema);
const Mezzo = mongoose.model('Mezzo', mezzoSchema);
const Settimana = mongoose.model('Settimana', settimanaSchema);
const Assegnazione = mongoose.model('Assegnazione', assegnazioneSchema);
const GiacenzaUtente = mongoose.model('GiacenzaUtente', giacenzaUtenteSchema);
const Utilizzo = mongoose.model('Utilizzo', utilizzoSchema);
const Aggiunta = mongoose.model('Aggiunta', aggiuntaSchema);
const RicaricaGiacenza = mongoose.model('RicaricaGiacenza', ricaricaGiacenzaSchema);

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token di accesso richiesto' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato: privilegi admin richiesti' });
  }
  next();
};

// ROUTES

// Auth Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Products Routes
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ attivo: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MODIFICATA: Giacenze personali dell'utente (con supporto multi-settimana)
app.get('/api/my-giacenze', authenticateToken, async (req, res) => {
  try {
    const { settimanaId } = req.query;
    
    let filter = { 
      userId: req.user.userId, 
      attiva: true 
    };
    
    // Se specificata una settimana, cerca giacenze per quella settimana O globali
    if (settimanaId) {
      filter.$or = [
        { settimanaId: settimanaId },
        { isGlobale: true }
      ];
    }
    
    const giacenze = await GiacenzaUtente.find(filter)
      .populate('productId', 'nome descrizione unita categoria')
      .populate('assegnatoDa', 'username')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .sort({ 'productId.nome': 1 });

    res.json(giacenze);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// MODIFICATA: Usa prodotto con supporto multi-settimana

app.post('/api/add-product', authenticateToken, async (req, res) => {
  try {
    const { productId, quantitaAggiunta, assegnazioneId } = req.body;

    // Trova giacenza personale
    const giacenza = await GiacenzaUtente.findOne({
      userId: req.user.userId,
      productId,
      attiva: true
    });

    if (!giacenza) {
      return res.status(404).json({ message: 'Giacenza non trovata' });
    }

    // Trova ultimo utilizzo
    const ultimoUtilizzo = await Utilizzo.findOne({
      userId: req.user.userId,
      productId
    }).sort({ createdAt: -1 });

    if (!ultimoUtilizzo) {
      return res.status(404).json({ message: 'Nessun utilizzo da annullare' });
    }

    // Aggiunge la quantità
    giacenza.quantitaDisponibile += quantitaAggiunta;
    await giacenza.save();

    // Rimuove l’ultimo utilizzo
    await Utilizzo.findByIdAndDelete(ultimoUtilizzo._id);

    res.status(200).json({
      message: 'Quantità aumentata e ultimo utilizzo annullato',
      nuovaQuantitaDisponibile: giacenza.quantitaDisponibile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SOSTITUISCI l'endpoint PUT /api/admin/utilizzi/:id nel tuo server.js con questo:

app.get('/api/admin/utilizzi', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, settimanaId, startDate, endDate, productId, poloId, mezzoId } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (settimanaId) filter.settimanaId = settimanaId;
    if (productId) filter.productId = productId;
    if (poloId) filter.poloId = poloId;
    if (mezzoId) filter.mezzoId = mezzoId;
    
    if (startDate && endDate) {
      filter.dataUtilizzo = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const utilizzi = await Utilizzo.find(filter)
      .populate('userId', 'username email')
      .populate('productId', 'nome unita categoria')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome')
      .populate('giacenzaUtenteId', 'quantitaDisponibile quantitaAssegnata quantitaMinima')
      .select('+note') // ← AGGIUNTO: include esplicitamente il campo note
      .sort({ dataUtilizzo: -1 });
    
    // Debug per verificare le note
    console.log('Primo utilizzo note:', utilizzi[0]?.note);
    
    res.json(utilizzi);
  } catch (error) {
    console.error('Errore get utilizzi:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/utilizzi/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantitaUtilizzata, note } = req.body;

    console.log('Dati ricevuti per modifica:', { id, quantitaUtilizzata, note }); // Debug

    // Trova l'utilizzo esistente
    const utilizzo = await Utilizzo.findById(id)
      .populate('giacenzaUtenteId')
      .populate('productId', 'nome unita');

    if (!utilizzo) {
      return res.status(404).json({ message: 'Utilizzo non trovato' });
    }

    // Calcola la differenza di quantità
    const quantitaPrecedente = utilizzo.quantitaUtilizzata;
    const nuovaQuantita = parseInt(quantitaUtilizzata);
    const differenza = nuovaQuantita - quantitaPrecedente;

    // Trova la giacenza associata
    const giacenza = utilizzo.giacenzaUtenteId;
    if (!giacenza) {
      return res.status(404).json({ message: 'Giacenza associata non trovata' });
    }

    // Verifica che la modifica non porti la giacenza sotto zero
    const nuovaQuantitaDisponibile = giacenza.quantitaDisponibile - differenza;
    if (nuovaQuantitaDisponibile < 0) {
      return res.status(400).json({ 
        message: `Impossibile modificare: la giacenza diventerebbe negativa (${nuovaQuantitaDisponibile})` 
      });
    }

    // Verifica che non si superi la quantità assegnata
    if (nuovaQuantitaDisponibile > giacenza.quantitaAssegnata) {
      return res.status(400).json({ 
        message: `Impossibile modificare: la quantità disponibile supererebbe quella assegnata` 
      });
    }

    // CORREZIONE: Aggiorna l'utilizzo con la nota
    utilizzo.quantitaUtilizzata = nuovaQuantita;
    utilizzo.note = note; // ← RIMOSSA la condizione || utilizzo.note
    utilizzo.quantitaRimasta = utilizzo.quantitaPrimaDellUso - nuovaQuantita;
    
    console.log('Salvando utilizzo con nota:', utilizzo.note); // Debug
    
    await utilizzo.save();

    // Aggiorna la giacenza
    giacenza.quantitaDisponibile = nuovaQuantitaDisponibile;
    await giacenza.save();

    // Restituisce l'utilizzo aggiornato con populate
    const utilizzoAggiornato = await Utilizzo.findById(id)
      .populate('userId', 'username email')
      .populate('productId', 'nome unita categoria')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome');

    console.log('Utilizzo aggiornato:', utilizzoAggiornato.note); // Debug

    res.json({
      message: 'Utilizzo modificato con successo',
      utilizzo: utilizzoAggiornato,
      giacenzaAggiornata: {
        quantitaDisponibile: giacenza.quantitaDisponibile,
        quantitaAssegnata: giacenza.quantitaAssegnata
      }
    });
  } catch (error) {
    console.error('Errore modifica utilizzo:', error);
    res.status(500).json({ message: error.message });
  }
});

// NUOVO: Elimina utilizzo e ripristina giacenza (Admin)
app.delete('/api/admin/utilizzi/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Trova l'utilizzo da eliminare
    const utilizzo = await Utilizzo.findById(id)
      .populate('giacenzaUtenteId')
      .populate('productId', 'nome unita')
      .populate('userId', 'username');

    if (!utilizzo) {
      return res.status(404).json({ message: 'Utilizzo non trovato' });
    }

    // Trova la giacenza associata
    const giacenza = utilizzo.giacenzaUtenteId;
    if (!giacenza) {
      return res.status(404).json({ message: 'Giacenza associata non trovata' });
    }

    // Ripristina la quantità nella giacenza
    const quantitaDaRipristinare = utilizzo.quantitaUtilizzata;
    const nuovaQuantitaDisponibile = giacenza.quantitaDisponibile + quantitaDaRipristinare;

    // Verifica che non si superi la quantità assegnata
    if (nuovaQuantitaDisponibile > giacenza.quantitaAssegnata) {
      return res.status(400).json({ 
        message: `Impossibile eliminare: la quantità ripristinata supererebbe quella assegnata` 
      });
    }

    // Aggiorna la giacenza
    giacenza.quantitaDisponibile = nuovaQuantitaDisponibile;
    await giacenza.save();

    // Salva info per il log prima di eliminare
    const logInfo = {
      prodotto: utilizzo.productId.nome,
      utente: utilizzo.userId.username,
      quantitaRipristinata: quantitaDaRipristinare,
      dataUtilizzo: utilizzo.dataUtilizzo
    };

    // Elimina l'utilizzo
    await Utilizzo.findByIdAndDelete(id);

    res.json({
      message: `Utilizzo eliminato e ripristinati ${quantitaDaRipristinare} ${utilizzo.productId.unita} di ${utilizzo.productId.nome}`,
      eliminato: logInfo,
      giacenzaAggiornata: {
        quantitaDisponibile: giacenza.quantitaDisponibile,
        quantitaAssegnata: giacenza.quantitaAssegnata
      }
    });
  } catch (error) {
    console.error('Errore eliminazione utilizzo:', error);
    res.status(500).json({ message: error.message });
  }
});



app.post('/api/admin/migrate-utilizzi-notes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Aggiorna tutti gli utilizzi che non hanno il campo note
    const result = await Utilizzo.updateMany(
      { note: { $exists: false } },
      { $set: { note: '' } }
    );
    
    res.json({
      message: 'Migrazione completata',
      documentiAggiornati: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NUOVO: Endpoint per statistiche utilizzi (bonus)
app.get('/api/admin/utilizzi/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { settimanaId, userId } = req.query;
    
    const matchFilter = {};
    if (settimanaId) matchFilter.settimanaId = new mongoose.Types.ObjectId(settimanaId);
    if (userId) matchFilter.userId = new mongoose.Types.ObjectId(userId);
    
    const stats = await Utilizzo.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            userId: '$userId',
            productId: '$productId'
          },
          totalUtilizzato: { $sum: '$quantitaUtilizzata' },
          numeroUtilizzi: { $sum: 1 },
          ultimoUtilizzo: { $max: '$dataUtilizzo' },
          primoUtilizzo: { $min: '$dataUtilizzo' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $project: {
          utente: { $arrayElemAt: ['$user.username', 0] },
          prodotto: { $arrayElemAt: ['$product.nome', 0] },
          unita: { $arrayElemAt: ['$product.unita', 0] },
          totalUtilizzato: 1,
          numeroUtilizzi: 1,
          ultimoUtilizzo: 1,
          primoUtilizzo: 1
        }
      },
      { $sort: { totalUtilizzato: -1 } }
    ]);
    
    const totali = await Utilizzo.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totaleUtilizzi: { $sum: 1 },
          totaleQuantita: { $sum: '$quantitaUtilizzata' },
          utentiAttivi: { $addToSet: '$userId' },
          prodottiUtilizzati: { $addToSet: '$productId' }
        }
      },
      {
        $project: {
          totaleUtilizzi: 1,
          totaleQuantita: 1,
          numeroUtentiAttivi: { $size: '$utentiAttivi' },
          numeroProdottiUtilizzati: { $size: '$prodottiUtilizzati' }
        }
      }
    ]);
    
    res.json({
      dettagli: stats,
      totali: totali[0] || {
        totaleUtilizzi: 0,
        totaleQuantita: 0,
        numeroUtentiAttivi: 0,
        numeroProdottiUtilizzati: 0
      }
    });
  } catch (error) {
    console.error('Errore statistiche utilizzi:', error);
    res.status(500).json({ message: error.message });
  }

});// MODIFICATA: Usa prodotto con supporto multi-settimana
app.post('/api/use-product', authenticateToken, async (req, res) => {
  try {
    const { productId, quantitaUtilizzata, assegnazioneId } = req.body;
    
    // Verifica assegnazione
    const assegnazione = await Assegnazione.findOne({
      _id: assegnazioneId,
      userId: req.user.userId,
      attiva: true
    });

    if (!assegnazione) {
      return res.status(403).json({ message: 'Assegnazione non valida' });
    }

    // Cerca prima giacenza specifica per settimana, poi globale
    let giacenza = await GiacenzaUtente.findOne({
      userId: req.user.userId,
      productId,
      settimanaId: assegnazione.settimanaId,
      attiva: true
    });

    // Se non trova giacenza specifica, cerca globale
    if (!giacenza) {
      giacenza = await GiacenzaUtente.findOne({
        userId: req.user.userId,
        productId,
        isGlobale: true,
        attiva: true
      });
    }

    if (!giacenza) {
      return res.status(404).json({ message: 'Prodotto non assegnato a questo utente' });
    }

    if (giacenza.quantitaDisponibile < quantitaUtilizzata) {
      return res.status(400).json({ 
        message: `Quantità insufficiente. Disponibile: ${giacenza.quantitaDisponibile}` 
      });
    }

    // Salva stato prima dell'uso
    const quantitaPrecedente = giacenza.quantitaDisponibile;

    // Crea utilizzo
    const utilizzo = new Utilizzo({
      userId: req.user.userId,
      productId,
      giacenzaUtenteId: giacenza._id,
      assegnazioneId,
      quantitaUtilizzata,
      quantitaPrimaDellUso: quantitaPrecedente,
      quantitaRimasta: quantitaPrecedente - quantitaUtilizzata,
      settimanaId: assegnazione.settimanaId,
      poloId: assegnazione.poloId,
      mezzoId: assegnazione.mezzoId
    });

    await utilizzo.save();

    // Aggiorna giacenza
    giacenza.quantitaDisponibile -= quantitaUtilizzata;

    await giacenza.save();

    res.status(201).json({
      utilizzo,
      nuovaQuantitaDisponibile: giacenza.quantitaDisponibile,
      sottoSoglia: giacenza.quantitaDisponibile <= giacenza.quantitaMinima
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Routes Admin per gestire giacenze
app.get('/api/admin/giacenze', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, settimanaId } = req.query;
    
    let filter = { attiva: true };
    if (userId) filter.userId = userId;
    if (settimanaId) {
      filter.$or = [
        { settimanaId: settimanaId },
        { isGlobale: true }
      ];
    }

    const giacenze = await GiacenzaUtente.find(filter)
      .populate('userId', 'username email')
      .populate('productId', 'nome categoria unita')
      .populate('assegnatoDa', 'username')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .sort({ 'userId.username': 1, 'productId.nome': 1 });

    res.json(giacenze);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MODIFICATA: Assegna/Aggiorna giacenza con supporto multi-settimana
app.post('/api/admin/assign-giacenza', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      userId, 
      productId, 
      quantitaAssegnata, 
      quantitaMinima, 
      note,
      aggiungiAlla = false,
      settimanaId = null, // Opzionale: se specificato, crea giacenza per settimana specifica
      applicaATutteLeSettimane = false // Se true, applica a tutte le settimane assegnate
    } = req.body;

    let giacenzeCreate = [];
    
    if (applicaATutteLeSettimane) {
      // Trova tutte le assegnazioni dell'utente
      const assegnazioni = await Assegnazione.find({ 
        userId, 
        attiva: true 
      }).distinct('settimanaId');
      
      // Crea/aggiorna giacenza per ogni settimana
      for (const settId of assegnazioni) {
        const result = await createOrUpdateGiacenza({
          userId,
          productId,
          quantitaAssegnata,
          quantitaMinima,
          note,
          aggiungiAlla,
          settimanaId: settId,
          isGlobale: false,
          assegnatoDa: req.user.userId
        });
        giacenzeCreate.push(result);
      }
    } else if (settimanaId) {
      // Crea giacenza per settimana specifica
      const result = await createOrUpdateGiacenza({
        userId,
        productId,
        quantitaAssegnata,
        quantitaMinima,
        note,
        aggiungiAlla,
        settimanaId,
        isGlobale: false,
        assegnatoDa: req.user.userId
      });
      giacenzeCreate.push(result);
    } else {
      // Crea giacenza globale
      const result = await createOrUpdateGiacenza({
        userId,
        productId,
        quantitaAssegnata,
        quantitaMinima,
        note,
        aggiungiAlla,
        isGlobale: true,
        assegnatoDa: req.user.userId
      });
      giacenzeCreate.push(result);
    }

    res.status(201).json(giacenzeCreate.length === 1 ? giacenzeCreate[0] : giacenzeCreate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Funzione helper per creare/aggiornare giacenza
async function createOrUpdateGiacenza(data) {
  const {
    userId,
    productId,
    quantitaAssegnata,
    quantitaMinima,
    note,
    aggiungiAlla,
    settimanaId,
    isGlobale,
    assegnatoDa
  } = data;

  // Verifica se esiste già
  let filter = { userId, productId, attiva: true };
  if (settimanaId) {
    filter.settimanaId = settimanaId;
  } else {
    filter.isGlobale = true;
  }

  let giacenza = await GiacenzaUtente.findOne(filter);

  if (giacenza) {
    // Aggiorna esistente
    const quantitaPrecedente = giacenza.quantitaDisponibile;
    
    if (aggiungiAlla) {
      giacenza.quantitaDisponibile += parseInt(quantitaAssegnata);
      giacenza.quantitaAssegnata += parseInt(quantitaAssegnata);
    } else {
      giacenza.quantitaDisponibile = parseInt(quantitaAssegnata);
      giacenza.quantitaAssegnata = parseInt(quantitaAssegnata);
    }
    
    giacenza.quantitaMinima = parseInt(quantitaMinima) || 0;
    giacenza.note = note;
    giacenza.dataAssegnazione = new Date();
    giacenza.assegnatoDa = assegnatoDa;

    await giacenza.save();

    // Registra ricarica se è un'aggiunta
    if (aggiungiAlla) {
      const ricarica = new RicaricaGiacenza({
        giacenzaUtenteId: giacenza._id,
        userId,
        productId,
        quantitaPrecedente,
        quantitaAggiunta: parseInt(quantitaAssegnata),
        quantitaNuova: giacenza.quantitaDisponibile,
        motivazione: note || 'Ricarica da admin',
        eseguitoDa: assegnatoDa
      });
      await ricarica.save();
    }
  } else {
    // Crea nuova giacenza
    giacenza = new GiacenzaUtente({
      userId,
      productId,
      settimanaId,
      quantitaAssegnata: parseInt(quantitaAssegnata),
      quantitaDisponibile: parseInt(quantitaAssegnata),
      quantitaMinima: parseInt(quantitaMinima) || 0,
      note,
      assegnatoDa,
      isGlobale: isGlobale || false
    });
    await giacenza.save();
  }

  const populated = await GiacenzaUtente.findById(giacenza._id)
    .populate('userId', 'username')
    .populate('productId', 'nome unita')
    .populate('assegnatoDa', 'username')
    .populate('settimanaId', 'numero anno');

  return populated;
}

// Utilizzi Routes
app.get('/api/utilizzi/my', authenticateToken, async (req, res) => {
  try {
    const { settimanaId } = req.query;
    const filter = { userId: req.user.userId };
    
    if (settimanaId) filter.settimanaId = settimanaId;
    
    const utilizzi = await Utilizzo.find(filter)
      .populate('productId', 'nome unita categoria')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome')
      .sort({ createdAt: -1 });
    
    res.json(utilizzi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin - Tutti gli utilizzi
app.get('/api/admin/utilizzi', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, settimanaId, startDate, endDate } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (settimanaId) filter.settimanaId = settimanaId;
    if (startDate && endDate) {
      filter.dataUtilizzo = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const utilizzi = await Utilizzo.find(filter)
      .populate('userId', 'username')
      .populate('productId', 'nome unita categoria')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome')
      .sort({ dataUtilizzo: -1 });
    
    res.json(utilizzi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Report Excel
app.get('/api/reports/excel', authenticateToken, async (req, res) => {
  try {
    const { settimanaId, poloId, mezzoId, userId } = req.query;
    
    const filter = {};
    if (settimanaId) filter.settimanaId = settimanaId;
    if (poloId) filter.poloId = poloId;
    if (mezzoId) filter.mezzoId = mezzoId;
    
    // Se non è admin, può vedere solo i suoi utilizzi
    if (req.user.role !== 'admin') {
      filter.userId = req.user.userId;
    } else if (userId) {
      filter.userId = userId;
    }
    
    const utilizzi = await Utilizzo.find(filter)
      .populate('userId', 'username')
      .populate('productId', 'nome categoria unita')
      .populate('giacenzaUtenteId')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome');
    
    // Aggrega dati per report
    const reportData = {};
    
    utilizzi.forEach(utilizzo => {
      const key = `${utilizzo.userId._id}-${utilizzo.productId._id}-${utilizzo.settimanaId?._id || 'global'}`;
      
      if (!reportData[key]) {
        let periodoSettimana = 'Non disponibile';
        if (utilizzo.settimanaId?.dataInizio && utilizzo.settimanaId?.dataFine) {
          const dataInizio = new Date(utilizzo.settimanaId.dataInizio);
          const dataFine = new Date(utilizzo.settimanaId.dataFine);
          periodoSettimana = `${dataInizio.toLocaleDateString('it-IT')} - ${dataFine.toLocaleDateString('it-IT')}`;
        }
        
        const quantitaDisponibile = utilizzo.giacenzaUtenteId?.quantitaDisponibile || 0;
        const quantitaMinima = utilizzo.giacenzaUtenteId?.quantitaMinima || 0;
        const quantitaAssegnata = utilizzo.giacenzaUtenteId?.quantitaAssegnata || 0;
        
        // Calcola quantità da ordinare
        let quantitaDaOrdinare = 0;
        if (quantitaDisponibile <= quantitaMinima) {
          // Se siamo sotto soglia, ordiniamo per tornare alla quantità assegnata
          quantitaDaOrdinare = quantitaAssegnata - quantitaDisponibile;
        }
        
        reportData[key] = {
          'Utente': utilizzo.userId.username,
          'Prodotto': utilizzo.productId.nome,
          'Categoria': utilizzo.productId.categoria || 'N/A',
          'Quantità Totale Utilizzata': 0,
          'Unità': utilizzo.productId.unita,
          'Quantità Disponibile': quantitaDisponibile,
          'Quantità Assegnata': quantitaAssegnata,
          'Quantità Minima': quantitaMinima,
          'Quantità da Ordinare': quantitaDaOrdinare, // ← NUOVA COLONNA
          'Polo': utilizzo.poloId?.nome || 'N/A',
          'Mezzo': utilizzo.mezzoId?.nome || 'N/A',
          'Periodo': periodoSettimana
        };
      }
      
      reportData[key]['Quantità Totale Utilizzata'] += utilizzo.quantitaUtilizzata;
    });
    
    // Converti in array e calcola stato
    const dataArray = Object.values(reportData).map(item => {
      // Ricalcola quantità da ordinare dopo aver sommato tutti gli utilizzi
      const disponibile = item['Quantità Disponibile'];
      const minima = item['Quantità Minima'];
      const assegnata = item['Quantità Assegnata'];
      
      let quantitaDaOrdinare = 0;
      if (disponibile <= minima && assegnata > 0) {
        quantitaDaOrdinare = assegnata - disponibile;
      }
      
      return {
        ...item,
        'Quantità da Ordinare': quantitaDaOrdinare,
        'Da Ordinare': (disponibile <= minima) ? 'SÌ' : 'NO',
        'Stato Giacenza': disponibile <= minima ? 'CRITICO' : 'OK',
        'Percentuale Rimasta': assegnata > 0 ? Math.round((disponibile / assegnata) * 100) + '%' : '0%'
      };
    });
    
    // Ordina per prodotti critici prima, poi per quantità da ordinare (decrescente)
    dataArray.sort((a, b) => {
      // Prima i prodotti critici (da ordinare = SÌ)
      if (a['Da Ordinare'] === 'SÌ' && b['Da Ordinare'] === 'NO') return -1;
      if (a['Da Ordinare'] === 'NO' && b['Da Ordinare'] === 'SÌ') return 1;
      
      // Poi per quantità da ordinare (decrescente)
      if (a['Da Ordinare'] === 'SÌ' && b['Da Ordinare'] === 'SÌ') {
        return b['Quantità da Ordinare'] - a['Quantità da Ordinare'];
      }
      
      // Infine per utente e prodotto
      return a['Utente'].localeCompare(b['Utente']) || a['Prodotto'].localeCompare(b['Prodotto']);
    });
    
    // Crea Excel con colonne ottimizzate
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(dataArray);
    
    // Impostazioni colonne con larghezze ottimizzate
    ws['!cols'] = [
      { wch: 15 }, // Utente
      { wch: 25 }, // Prodotto
      { wch: 15 }, // Categoria
      { wch: 12 }, // Quantità Utilizzata
      { wch: 8 },  // Unità
      { wch: 12 }, // Disponibile
      { wch: 12 }, // Assegnata
      { wch: 12 }, // Minima
      { wch: 15 }, // Quantità da Ordinare ← NUOVA
      { wch: 15 }, // Polo
      { wch: 15 }, // Mezzo
      { wch: 20 }, // Periodo
      { wch: 12 }, // Da Ordinare
      { wch: 12 }, // Stato
      { wch: 12 }  // Percentuale Rimasta
    ];
    
    // Formattazione condizionale per le righe critiche
    const range = xlsx.utils.decode_range(ws['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
      const daOrdinareCell = ws[xlsx.utils.encode_cell({ r: row, c: 12 })]; // Colonna "Da Ordinare"
      if (daOrdinareCell && daOrdinareCell.v === 'SÌ') {
        // Evidenzia in rosso le righe critiche
        for (let col = 0; col <= range.e.c; col++) {
          const cellRef = xlsx.utils.encode_cell({ r: row, c: col });
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = {
            fill: { fgColor: { rgb: "FFE6E6" } }, // Sfondo rosso chiaro
            font: { bold: true }
          };
        }
      }
    }
    
    xlsx.utils.book_append_sheet(wb, ws, 'Report Utilizzi');
    
    // Aggiungi un secondo foglio con il riepilogo ordini
    const riepilogoOrdini = dataArray
      .filter(item => item['Da Ordinare'] === 'SÌ')
      .map(item => ({
        'Prodotto': item['Prodotto'],
        'Categoria': item['Categoria'],
        'Utente': item['Utente'],
        'Quantità da Ordinare': item['Quantità da Ordinare'],
        'Unità': item['Unità'],
        'Disponibile': item['Quantità Disponibile'],
        'Minima': item['Quantità Minima'],
        'Note': `Sotto soglia - Urgente`
      }));
    
    if (riepilogoOrdini.length > 0) {
      const wsOrdini = xlsx.utils.json_to_sheet(riepilogoOrdini);
      wsOrdini['!cols'] = [
        { wch: 25 }, // Prodotto
        { wch: 15 }, // Categoria
        { wch: 15 }, // Utente
        { wch: 15 }, // Quantità da Ordinare
        { wch: 8 },  // Unità
        { wch: 12 }, // Disponibile
        { wch: 12 }, // Minima
        { wch: 20 }  // Note
      ];
      xlsx.utils.book_append_sheet(wb, wsOrdini, 'Lista Ordini');
    }
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_giacenze_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route rimanenti
app.get('/api/poli', authenticateToken, async (req, res) => {
  try {
    const poli = await Polo.find({ attivo: true });
    res.json(poli);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/mezzi', authenticateToken, async (req, res) => {
  try {
    const mezzi = await Mezzo.find({ attivo: true });
    res.json(mezzi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/settimane', authenticateToken, async (req, res) => {
  try {
    const settimane = await Settimana.find().sort({ anno: -1, numero: -1 });
    res.json(settimane);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/assegnazioni', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const assegnazioni = await Assegnazione.find({ attiva: true })
      .populate('userId', 'username')
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome')
      .populate('settimanaId', 'numero anno dataInizio dataFine');
    res.json(assegnazioni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/assegnazioni/my', authenticateToken, async (req, res) => {
  try {
    const assegnazioni = await Assegnazione.find({ 
      userId: req.user.userId, 
      attiva: true 
    })
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome')
      .populate('settimanaId', 'numero anno dataInizio dataFine')
      .sort({ 'settimanaId.anno': -1, 'settimanaId.numero': -1 });
    res.json(assegnazioni);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/assegnazioni', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const assegnazione = new Assegnazione({
      ...req.body,
      createdBy: req.user.userId
    });
    await assegnazione.save();
    
    const populated = await Assegnazione.findById(assegnazione._id)
      .populate('userId', 'username')
      .populate('poloId', 'nome')
      .populate('mezzoId', 'nome')
      .populate('settimanaId', 'numero anno dataInizio dataFine');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// NUOVA: Modifica assegnazione
app.put('/api/assegnazioni/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const assegnazione = await Assegnazione.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('userId', 'username')
    .populate('poloId', 'nome')
    .populate('mezzoId', 'nome')
    .populate('settimanaId', 'numero anno dataInizio dataFine');
    
    if (!assegnazione) {
      return res.status(404).json({ message: 'Assegnazione non trovata' });
    }
    
    res.json(assegnazione);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// NUOVA: Elimina assegnazione
app.delete('/api/assegnazioni/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete - marca come non attiva
    const assegnazione = await Assegnazione.findByIdAndUpdate(
      id,
      { attiva: false },
      { new: true }
    );
    
    if (!assegnazione) {
      return res.status(404).json({ message: 'Assegnazione non trovata' });
    }
    
    res.json({ message: 'Assegnazione eliminata con successo' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// NUOVA: Copia giacenze da una settimana all'altra
app.post('/api/admin/copy-giacenze', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, fromSettimanaId, toSettimanaId } = req.body;
    
    if (!userId || !fromSettimanaId || !toSettimanaId) {
      return res.status(400).json({ 
        message: 'userId, fromSettimanaId e toSettimanaId sono richiesti' 
      });
    }
    
    // Trova giacenze della settimana di origine
    const sourceGiacenze = await GiacenzaUtente.find({
      userId,
      settimanaId: fromSettimanaId,
      attiva: true
    });
    
    const copiedGiacenze = [];
    
    for (const sourceGiacenza of sourceGiacenze) {
      // Verifica se esiste già nella settimana di destinazione
      const existingGiacenza = await GiacenzaUtente.findOne({
        userId,
        productId: sourceGiacenza.productId,
        settimanaId: toSettimanaId,
        attiva: true
      });
      
      if (!existingGiacenza) {
        // Crea nuova giacenza
        const newGiacenza = new GiacenzaUtente({
          userId: sourceGiacenza.userId,
          productId: sourceGiacenza.productId,
          settimanaId: toSettimanaId,
          quantitaAssegnata: sourceGiacenza.quantitaAssegnata,
          quantitaDisponibile: sourceGiacenza.quantitaAssegnata, // Reset alla quantità assegnata
          quantitaMinima: sourceGiacenza.quantitaMinima,
          note: `Copiata da settimana ${fromSettimanaId}`,
          assegnatoDa: req.user.userId,
          isGlobale: false
        });
        
        await newGiacenza.save();
        copiedGiacenze.push(newGiacenza);
      }
    }
    
    res.json({
      message: `Copiate ${copiedGiacenze.length} giacenze`,
      giacenze: copiedGiacenze
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route di test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend giacenze multi-settimana attivo!', 
    timestamp: new Date().toISOString(),
    version: '3.0 - Multi-Settimana'
  });
});

// Script di inizializzazione dati di test
async function initTestData() {
  try {
    // Verifica se ci sono già dati
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Dati già presenti nel database');
      return;
    }

    console.log('Inizializzazione dati di test...');

    // Crea utenti
    const adminPassword = await bcrypt.hash('password123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      username: 'admin',
      password: adminPassword,
      email: 'admin@test.com',
      role: 'admin'
    });

    const user1 = await User.create({
      username: 'operatore1',
      password: userPassword,
      email: 'operatore1@test.com',
      role: 'user'
    });

    const user2 = await User.create({
      username: 'operatore2',
      password: userPassword,
      email: 'operatore2@test.com',
      role: 'user'
    });

    // Crea prodotti
    const prodotti = [
      { nome: 'Guanti in lattice', categoria: 'DPI', unita: 'paia', descrizione: 'Guanti monouso' },
      { nome: 'Mascherine FFP2', categoria: 'DPI', unita: 'pz', descrizione: 'Mascherine protettive' },
      { nome: 'Gel igienizzante', categoria: 'Igiene', unita: 'flaconi', descrizione: '500ml' },
      { nome: 'Sacchi spazzatura', categoria: 'Pulizia', unita: 'pz', descrizione: '70x110cm' },
      { nome: 'Detergente pavimenti', categoria: 'Pulizia', unita: 'litri', descrizione: 'Detergente universale' }
    ];

    const createdProducts = [];
    for (const prod of prodotti) {
      const product = await Product.create(prod);
      createdProducts.push(product);
    }

    // Crea poli
    const poli = await Polo.create([
      { nome: 'Polo Nord', descrizione: 'Area nord della città' },
      { nome: 'Polo Sud', descrizione: 'Area sud della città' },
      { nome: 'Polo Centro', descrizione: 'Centro città' }
    ]);

    // Crea mezzi
    const mezzi = await Mezzo.create([
      { nome: 'Furgone 1', descrizione: 'Fiat Ducato' },
      { nome: 'Furgone 2', descrizione: 'Iveco Daily' },
      { nome: 'Auto 1', descrizione: 'Fiat Panda' }
    ]);

    // Crea settimane
    const currentDate = new Date();
    const settimane = [];
    
    for (let i = 0; i < 4; i++) {
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - (7 * i));
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      const weekNumber = Math.ceil((startDate.getDate() + startDate.getDay()) / 7);
      
      const settimana = await Settimana.create({
        numero: weekNumber,
        anno: startDate.getFullYear(),
        dataInizio: startDate,
        dataFine: endDate
      });
      settimane.push(settimana);
    }

    // Crea assegnazioni
    await Assegnazione.create({
      userId: user1._id,
      poloId: poli[0]._id,
      mezzoId: mezzi[0]._id,
      settimanaId: settimane[0]._id,
      createdBy: admin._id
    });

    await Assegnazione.create({
      userId: user1._id,
      poloId: poli[1]._id,
      mezzoId: mezzi[1]._id,
      settimanaId: settimane[1]._id,
      createdBy: admin._id
    });

    // Crea alcune giacenze globali di esempio
    for (const user of [user1, user2]) {
      for (let i = 0; i < 3; i++) {
        await GiacenzaUtente.create({
          userId: user._id,
          productId: createdProducts[i]._id,
          quantitaAssegnata: 100,
          quantitaDisponibile: 100,
          quantitaMinima: 20,
          assegnatoDa: admin._id,
          isGlobale: true,
          note: 'Giacenza iniziale'
        });
      }
    }

    console.log('✅ Dati di test inizializzati con successo!');
    console.log('📋 Utenti creati:');
    console.log('   - admin / password123');
    console.log('   - operatore1 / password123');
    console.log('   - operatore2 / password123');
    
  } catch (error) {
    console.error('❌ Errore inizializzazione dati:', error);
  }


}

// ================================
// ENDPOINT GESTIONE UTENTI (ADMIN)
// ================================

// GET - Lista tutti gli utenti (Admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Crea nuovo utente (Admin)
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validazioni
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email e password sono obbligatori' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La password deve essere di almeno 6 caratteri' });
    }

    // Verifica se username o email esistono già
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? 'Username già esistente' 
          : 'Email già esistente' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea utente
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: ['admin', 'user'].includes(role) ? role : 'user'
    });

    await newUser.save();

    // Restituisce utente senza password
    const userResponse = await User.findById(newUser._id, '-password');
    
    res.status(201).json({
      message: 'Utente creato con successo',
      user: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: field === 'username' ? 'Username già esistente' : 'Email già esistente'
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// PUT - Modifica utente (Admin)
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Validazioni
    if (!username || !email) {
      return res.status(400).json({ message: 'Username e email sono obbligatori' });
    }

    // Verifica se l'utente esiste
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Verifica se username/email sono già usati da altri utenti
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? 'Username già utilizzato da un altro utente' 
          : 'Email già utilizzata da un altro utente' 
      });
    }

    // Aggiorna utente
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        username,
        email,
        role: ['admin', 'user'].includes(role) ? role : user.role
      },
      { new: true, select: '-password' }
    );

    res.json({
      message: 'Utente aggiornato con successo',
      user: updatedUser
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: field === 'username' ? 'Username già utilizzato' : 'Email già utilizzata'
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Elimina utente (Admin)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se l'utente esiste
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Impedisci di eliminare se stesso
    if (id === req.user.userId) {
      return res.status(400).json({ message: 'Non puoi eliminare il tuo account' });
    }

    // Elimina giacenze associate
    await GiacenzaUtente.deleteMany({ userId: id });
    
    // Elimina utilizzi associati
    await Utilizzo.deleteMany({ userId: id });
    
    // Elimina assegnazioni associate
    await Assegnazione.deleteMany({ userId: id });

    // Elimina utente
    await User.findByIdAndDelete(id);

    res.json({
      message: 'Utente e tutti i dati associati eliminati con successo',
      deletedUser: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Reset password utente (Admin)
app.post('/api/admin/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La password deve essere di almeno 6 caratteri' });
    }

    // Verifica se l'utente esiste
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Hash nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aggiorna password
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.json({
      message: 'Password di ' + user.username + ' aggiornata con successo'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================================
// ENDPOINT GESTIONE PRODOTTI (ADMIN)
// ================================

// GET - Lista tutti i prodotti (Admin)
app.get('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { categoria, attivo } = req.query;
    
    const filter = {};
    if (categoria) filter.categoria = categoria;
    if (attivo !== undefined) filter.attivo = attivo === 'true';
    
    const products = await Product.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Crea nuovo prodotto (Admin)
app.post('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, descrizione, categoria, unita = 'pz', attivo = true } = req.body;

    // Validazioni
    if (!nome || !categoria) {
      return res.status(400).json({ message: 'Nome e categoria sono obbligatori' });
    }

    // Verifica se il prodotto esiste già (case insensitive)
    const nomeRegex = new RegExp('^' + nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    const categoriaRegex = new RegExp('^' + categoria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    
    const existingProduct = await Product.findOne({ 
      nome: { $regex: nomeRegex },
      categoria: { $regex: categoriaRegex }
    });

    if (existingProduct) {
      return res.status(400).json({ 
        message: 'Prodotto con questo nome e categoria già esistente' 
      });
    }

    // Crea prodotto
    const newProduct = new Product({
      nome: nome.trim(),
      descrizione: descrizione ? descrizione.trim() : '',
      categoria: categoria.trim(),
      unita: unita.trim(),
      attivo: Boolean(attivo)
    });

    await newProduct.save();
    
    res.status(201).json({
      message: 'Prodotto creato con successo',
      product: newProduct
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Modifica prodotto (Admin)
app.put('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descrizione, categoria, unita, attivo } = req.body;

    // Validazioni
    if (!nome || !categoria) {
      return res.status(400).json({ message: 'Nome e categoria sono obbligatori' });
    }

    // Verifica se il prodotto esiste
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Prodotto non trovato' });
    }

    // Verifica se nome/categoria sono già usati da altri prodotti
    const nomeRegex = new RegExp('^' + nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    const categoriaRegex = new RegExp('^' + categoria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    
    const existingProduct = await Product.findOne({
      _id: { $ne: id },
      nome: { $regex: nomeRegex },
      categoria: { $regex: categoriaRegex }
    });

    if (existingProduct) {
      return res.status(400).json({ 
        message: 'Un altro prodotto ha già questo nome e categoria' 
      });
    }

    // Aggiorna prodotto
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        nome: nome.trim(),
        descrizione: descrizione ? descrizione.trim() : '',
        categoria: categoria.trim(),
        unita: unita ? unita.trim() : product.unita,
        attivo: attivo !== undefined ? Boolean(attivo) : product.attivo
      },
      { new: true }
    );

    res.json({
      message: 'Prodotto aggiornato con successo',
      product: updatedProduct
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Elimina prodotto (Admin)
app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se il prodotto esiste
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Prodotto non trovato' });
    }

    // Verifica se ci sono giacenze associate
    const giacenzeCount = await GiacenzaUtente.countDocuments({ productId: id });
    if (giacenzeCount > 0) {
      return res.status(400).json({ 
        message: 'Impossibile eliminare: ci sono ' + giacenzeCount + ' giacenze associate a questo prodotto. Elimina prima le giacenze.'
      });
    }

    // Verifica se ci sono utilizzi associati
    const utilizziCount = await Utilizzo.countDocuments({ productId: id });
    if (utilizziCount > 0) {
      return res.status(400).json({ 
        message: 'Impossibile eliminare: ci sono ' + utilizziCount + ' utilizzi registrati per questo prodotto. Considera di disattivarlo invece di eliminarlo.'
      });
    }

    // Elimina prodotto
    await Product.findByIdAndDelete(id);

    res.json({
      message: 'Prodotto eliminato con successo',
      deletedProduct: {
        id: product._id,
        nome: product.nome,
        categoria: product.categoria
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH - Toggle stato attivo prodotto (Admin)
app.patch('/api/admin/products/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { attivo } = req.body;

    // Verifica se il prodotto esiste
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Prodotto non trovato' });
    }

    // Aggiorna stato
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { attivo: Boolean(attivo) },
      { new: true }
    );

    // Se viene disattivato, verifica giacenze attive
    if (!attivo) {
      const giacenzeAttive = await GiacenzaUtente.countDocuments({ 
        productId: id, 
        attiva: true,
        quantitaDisponibile: { $gt: 0 }
      });
      
      if (giacenzeAttive > 0) {
        return res.json({
          message: 'Prodotto disattivato con successo',
          product: updatedProduct,
          warning: 'Attenzione: ci sono ancora ' + giacenzeAttive + ' giacenze attive per questo prodotto'
        });
      }
    }

    res.json({
      message: 'Prodotto ' + (attivo ? 'attivato' : 'disattivato') + ' con successo',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Avvia il server
app.listen(process.env.PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server giacenze multi-settimana su porta ${PORT}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET ? 'Configurato' : 'ERRORE: Mancante!'}`);
  console.log(`🗄️  MongoDB: ${MONGODB_URI}`);
  console.log(`🌐 Test API: http://localhost:${PORT}/api/test`);
  
  // Inizializza dati di test se il database è vuoto
  await initTestData();
});