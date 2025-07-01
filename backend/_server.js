// server.js - Backend con sistema giacenze personali
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

// Connessione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/giacenze';
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
  // RIMOSSO: quantitaDisponibile e quantitaMinima
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

// NUOVO Schema giacenze personali
const giacenzaUtenteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantitaAssegnata: { type: Number, required: true, default: 0 },
  quantitaDisponibile: { type: Number, required: true, default: 0 },
  quantitaMinima: { type: Number, required: true, default: 0 },
  dataAssegnazione: { type: Date, default: Date.now },
  assegnatoDa: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  attiva: { type: Boolean, default: true }
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
  mezzoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mezzo' }
}, { timestamps: true });

// NUOVO Schema ricariche
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

// Auth Routes (invariate)
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

// Products Routes (solo master data)
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ attivo: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NUOVA Route: Giacenze personali dell'utente
app.get('/api/my-giacenze', authenticateToken, async (req, res) => {
  try {
    const giacenze = await GiacenzaUtente.find({ 
      userId: req.user.userId, 
      attiva: true 
    })
    .populate('productId', 'nome descrizione unita categoria')
    .populate('assegnatoDa', 'username')
    .sort({ 'productId.nome': 1 });

    res.json(giacenze);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NUOVA Route: Usa prodotto (scala dalla giacenza personale)
app.post('/api/use-product', authenticateToken, async (req, res) => {
  try {
    const { productId, quantitaUtilizzata, assegnazioneId } = req.body;
    
    // Trova la giacenza personale
    const giacenza = await GiacenzaUtente.findOne({
      userId: req.user.userId,
      productId,
      attiva: true
    });

    if (!giacenza) {
      return res.status(404).json({ message: 'Prodotto non assegnato a questo utente' });
    }

    if (giacenza.quantitaDisponibile < quantitaUtilizzata) {
      return res.status(400).json({ 
        message: `Quantità insufficiente. Disponibile: ${giacenza.quantitaDisponibile}` 
      });
    }

    // Verifica assegnazione
    const assegnazione = await Assegnazione.findOne({
      _id: assegnazioneId,
      userId: req.user.userId,
      attiva: true
    });

    if (!assegnazione) {
      return res.status(403).json({ message: 'Assegnazione non valida' });
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
    const { userId } = req.query;
    
    const filter = { attiva: true };
    if (userId) filter.userId = userId;

    const giacenze = await GiacenzaUtente.find(filter)
      .populate('userId', 'username email')
      .populate('productId', 'nome categoria unita')
      .populate('assegnatoDa', 'username')
      .sort({ 'userId.username': 1, 'productId.nome': 1 });

    res.json(giacenze);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NUOVA Route: Assegna/Aggiorna giacenza a utente
app.post('/api/admin/assign-giacenza', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      userId, 
      productId, 
      quantitaAssegnata, 
      quantitaMinima, 
      note,
      aggiungiAlla = false // se true, aggiunge alla quantità esistente
    } = req.body;

    // Verifica se esiste già
    let giacenza = await GiacenzaUtente.findOne({ userId, productId, attiva: true });

    if (giacenza) {
      // Aggiorna esistente
      const quantitaPrecedente = giacenza.quantitaDisponibile;
      
      if (aggiungiAlla) {
        giacenza.quantitaDisponibile += quantitaAssegnata;
        giacenza.quantitaAssegnata += quantitaAssegnata;
      } else {
        giacenza.quantitaDisponibile = quantitaAssegnata;
        giacenza.quantitaAssegnata = quantitaAssegnata;
      }
      
      giacenza.quantitaMinima = quantitaMinima;
      giacenza.note = note;
      giacenza.dataAssegnazione = new Date();
      giacenza.assegnatoDa = req.user.userId;

      await giacenza.save();

      // Registra ricarica se è un'aggiunta
      if (aggiungiAlla) {
        const ricarica = new RicaricaGiacenza({
          giacenzaUtenteId: giacenza._id,
          userId,
          productId,
          quantitaPrecedente,
          quantitaAggiunta: quantitaAssegnata,
          quantitaNuova: giacenza.quantitaDisponibile,
          motivazione: note || 'Ricarica da admin',
          eseguitoDa: req.user.userId
        });
        await ricarica.save();
      }
    } else {
      // Crea nuova giacenza
      giacenza = new GiacenzaUtente({
        userId,
        productId,
        quantitaAssegnata,
        quantitaDisponibile: quantitaAssegnata,
        quantitaMinima,
        note,
        assegnatoDa: req.user.userId
      });
      await giacenza.save();
    }

    const populated = await GiacenzaUtente.findById(giacenza._id)
      .populate('userId', 'username')
      .populate('productId', 'nome unita')
      .populate('assegnatoDa', 'username');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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

// Report Excel aggiornato
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
      const key = `${utilizzo.userId._id}-${utilizzo.productId._id}`;
      
      if (!reportData[key]) {
        let periodoSettimana = 'Non disponibile';
        if (utilizzo.settimanaId?.dataInizio && utilizzo.settimanaId?.dataFine) {
          const dataInizio = new Date(utilizzo.settimanaId.dataInizio);
          const dataFine = new Date(utilizzo.settimanaId.dataFine);
          periodoSettimana = `${dataInizio.toLocaleDateString('it-IT')} - ${dataFine.toLocaleDateString('it-IT')}`;
        }
        
        reportData[key] = {
          'Utente': utilizzo.userId.username,
          'Prodotto': utilizzo.productId.nome,
          'Categoria': utilizzo.productId.categoria || 'N/A',
          'Quantità Totale Utilizzata': 0,
          'Unità': utilizzo.productId.unita,
          'Quantità Disponibile': utilizzo.giacenzaUtenteId?.quantitaDisponibile || 0,
          'Quantità Minima': utilizzo.giacenzaUtenteId?.quantitaMinima || 0,
          'Polo': utilizzo.poloId?.nome || 'N/A',
          'Mezzo': utilizzo.mezzoId?.nome || 'N/A',
          'Periodo': periodoSettimana
        };
      }
      
      reportData[key]['Quantità Totale Utilizzata'] += utilizzo.quantitaUtilizzata;
    });
    
    // Converti in array e calcola stato
    const dataArray = Object.values(reportData).map(item => ({
      ...item,
      'Da Ordinare': (item['Quantità Disponibile'] <= item['Quantità Minima']) ? 'SÌ' : 'NO',
      'Stato Giacenza': item['Quantità Disponibile'] <= item['Quantità Minima'] ? 'CRITICO' : 'OK'
    }));
    
    // Ordina per utente e prodotto critico
    dataArray.sort((a, b) => {
      if (a['Da Ordinare'] === 'SÌ' && b['Da Ordinare'] === 'NO') return -1;
      if (a['Da Ordinare'] === 'NO' && b['Da Ordinare'] === 'SÌ') return 1;
      return a['Utente'].localeCompare(b['Utente']) || a['Prodotto'].localeCompare(b['Prodotto']);
    });
    
    // Crea Excel
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(dataArray);
    
    ws['!cols'] = [
      { wch: 15 }, // Utente
      { wch: 25 }, // Prodotto
      { wch: 15 }, // Categoria
      { wch: 12 }, // Quantità Utilizzata
      { wch: 8 },  // Unità
      { wch: 12 }, // Disponibile
      { wch: 12 }, // Minima
      { wch: 15 }, // Polo
      { wch: 15 }, // Mezzo
      { wch: 20 }, // Periodo
      { wch: 12 }, // Da Ordinare
      { wch: 12 }  // Stato
    ];
    
    xlsx.utils.book_append_sheet(wb, ws, 'Report Utilizzi');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_giacenze_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route rimanenti (poli, mezzi, settimane, assegnazioni, users)
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
      .populate('settimanaId', 'numero anno dataInizio dataFine');
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
    message: 'Backend giacenze personali attivo!', 
    timestamp: new Date().toISOString(),
    version: '2.0 - Giacenze Personali'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server giacenze personali su porta ${PORT}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET ? 'Configurato' : 'ERRORE: Mancante!'}`);
  console.log(`🗄️  MongoDB: ${MONGODB_URI}`);
  console.log(`🌐 Test API: http://localhost:${PORT}/api/test`);
});