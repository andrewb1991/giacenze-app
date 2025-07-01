// seeds/seed.js - Script per inizializzare il database con dati di esempio
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connessione MongoDB
mongoose.connect('mongodb+srv://andreabramucci:qWREkLZknWIxlawS@automando.fwkavbr.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schema (ripetuti dal server.js)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
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

const productSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descrizione: String,
  quantitaDisponibile: { type: Number, default: 0 },
  quantitaMinima: { type: Number, default: 0 },
  unita: { type: String, default: 'pz' },
  categoria: String,
  attivo: { type: Boolean, default: true }
}, { timestamps: true });

const settimanaSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  anno: { type: Number, required: true },
  dataInizio: { type: Date, required: true },
  dataFine: { type: Date, required: true },
  attiva: { type: Boolean, default: true }
}, { timestamps: true });

// Modelli
const User = mongoose.model('User', userSchema);
const Polo = mongoose.model('Polo', poloSchema);
const Mezzo = mongoose.model('Mezzo', mezzoSchema);
const Product = mongoose.model('Product', productSchema);
const Settimana = mongoose.model('Settimana', settimanaSchema);

async function seedDatabase() {
  try {
    console.log('🌱 Inizializzazione database...');

    // Cancella dati esistenti
    await Promise.all([
      User.deleteMany({}),
      Polo.deleteMany({}),
      Mezzo.deleteMany({}),
      Product.deleteMany({}),
      Settimana.deleteMany({})
    ]);

    console.log('🗑️  Dati esistenti cancellati');

    // Crea utenti
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.insertMany([
      {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@giacenze.com',
        role: 'admin'
      },
      {
        username: 'operatore1',
        password: hashedPassword,
        email: 'operatore1@giacenze.com',
        role: 'user'
      },
      {
        username: 'operatore2',
        password: hashedPassword,
        email: 'operatore2@giacenze.com',
        role: 'user'
      },
      {
        username: 'operatore3',
        password: hashedPassword,
        email: 'operatore3@giacenze.com',
        role: 'user'
      }
    ]);

    console.log('👥 Utenti creati:', users.length);

    // Crea poli
    const poli = await Polo.insertMany([
      {
        nome: 'Polo Nord',
        descrizione: 'Sede operativa zona nord della città',
        attivo: true
      },
      {
        nome: 'Polo Sud',
        descrizione: 'Sede operativa zona sud della città',
        attivo: true
      },
      {
        nome: 'Polo Centro',
        descrizione: 'Sede operativa centro città',
        attivo: true
      },
      {
        nome: 'Polo Est',
        descrizione: 'Sede operativa zona est',
        attivo: true
      },
      {
        nome: 'Polo Ovest',
        descrizione: 'Sede operativa zona ovest',
        attivo: true
      }
    ]);

    console.log('🏢 Poli creati:', poli.length);

    // Crea mezzi
    const mezzi = await Mezzo.insertMany([
      {
        nome: 'Ambulanza A01',
        descrizione: 'Ambulanza di soccorso avanzato',
        attivo: true
      },
      {
        nome: 'Ambulanza A02',
        descrizione: 'Ambulanza di soccorso base',
        attivo: true
      },
      {
        nome: 'Automedica M01',
        descrizione: 'Automedica con medico a bordo',
        attivo: true
      },
      {
        nome: 'Ambulanza A03',
        descrizione: 'Ambulanza di soccorso avanzato',
        attivo: true
      },
      {
        nome: 'Mezzo Speciale S01',
        descrizione: 'Mezzo per trasporti speciali',
        attivo: true
      },
      {
        nome: 'Ambulanza A04',
        descrizione: 'Ambulanza di soccorso base',
        attivo: true
      }
    ]);

    console.log('🚑 Mezzi creati:', mezzi.length);

    // Crea prodotti
    const products = await Product.insertMany([
      {
        nome: 'Guanti in lattice',
        descrizione: 'Guanti monouso in lattice sterili',
        quantitaDisponibile: 500,
        quantitaMinima: 100,
        unita: 'pz',
        categoria: 'DPI',
        attivo: true
      },
      {
        nome: 'Mascherine chirurgiche',
        descrizione: 'Mascherine chirurgiche monouso',
        quantitaDisponibile: 300,
        quantitaMinima: 50,
        unita: 'pz',
        categoria: 'DPI',
        attivo: true
      },
      {
        nome: 'Siringhe 10ml',
        descrizione: 'Siringhe sterili da 10ml',
        quantitaDisponibile: 150,
        quantitaMinima: 30,
        unita: 'pz',
        categoria: 'Dispositivi medici',
        attivo: true
      },
      {
        nome: 'Garze sterili',
        descrizione: 'Garze sterili per medicazioni',
        quantitaDisponibile: 80,
        quantitaMinima: 20,
        unita: 'pz',
        categoria: 'Medicazioni',
        attivo: true
      },
      {
        nome: 'Disinfettante mani',
        descrizione: 'Gel disinfettante per le mani',
        quantitaDisponibile: 25,
        quantitaMinima: 10,
        unita: 'fl',
        categoria: 'Igiene',
        attivo: true
      },
      {
        nome: 'Termometri digitali',
        descrizione: 'Termometri digitali a infrarossi',
        quantitaDisponibile: 8,
        quantitaMinima: 5,
        unita: 'pz',
        categoria: 'Strumentazione',
        attivo: true
      },
      {
        nome: 'Bende elastiche',
        descrizione: 'Bende elastiche autoadesive',
        quantitaDisponibile: 45,
        quantitaMinima: 15,
        unita: 'pz',
        categoria: 'Medicazioni',
        attivo: true
      },
      {
        nome: 'Aghi per siringhe',
        descrizione: 'Aghi sterili varie misure',
        quantitaDisponibile: 200,
        quantitaMinima: 50,
        unita: 'pz',
        categoria: 'Dispositivi medici',
        attivo: true
      },
      {
        nome: 'Ossigeno portatile',
        descrizione: 'Bombole di ossigeno portatili',
        quantitaDisponibile: 12,
        quantitaMinima: 5,
        unita: 'pz',
        categoria: 'Gas medicali',
        attivo: true
      },
      {
        nome: 'Kit primo soccorso',
        descrizione: 'Kit completo per primo soccorso',
        quantitaDisponibile: 15,
        quantitaMinima: 8,
        unita: 'pz',
        categoria: 'Kit',
        attivo: true
      },
      {
        nome: 'Cerotti assortiti',
        descrizione: 'Cerotti di varie dimensioni',
        quantitaDisponibile: 120,
        quantitaMinima: 30,
        unita: 'pz',
        categoria: 'Medicazioni',
        attivo: true
      },
      {
        nome: 'Soluzione fisiologica',
        descrizione: 'Soluzione fisiologica sterile 500ml',
        quantitaDisponibile: 40,
        quantitaMinima: 15,
        unita: 'fl',
        categoria: 'Farmaci',
        attivo: true
      }
    ]);

    console.log('📦 Prodotti creati:', products.length);

    // Crea settimane (ultimi 6 mesi e prossimi 6 mesi)
    const settimane = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Calcola il numero della settimana corrente
    const startOfYear = new Date(currentYear, 0, 1);
    const pastDays = (currentDate - startOfYear) / 86400000;
    const currentWeek = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);

    // Crea settimane da 20 settimane fa a 20 settimane avanti
    for (let i = -20; i <= 20; i++) {
      const weekNumber = currentWeek + i;
      let year = currentYear;
      let adjustedWeekNumber = weekNumber;

      // Gestisci il cambio di anno
      if (weekNumber <= 0) {
        year = currentYear - 1;
        adjustedWeekNumber = 52 + weekNumber;
      } else if (weekNumber > 52) {
        year = currentYear + 1;
        adjustedWeekNumber = weekNumber - 52;
      }

      // Calcola date di inizio e fine settimana (approssimative)
      const startOfWeek = new Date(year, 0, 1 + (adjustedWeekNumber - 1) * 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      settimane.push({
        numero: adjustedWeekNumber,
        anno: year,
        dataInizio: startOfWeek,
        dataFine: endOfWeek,
        attiva: true
      });
    }

    const settimaneCreate = await Settimana.insertMany(settimane);
    console.log('📅 Settimane create:', settimaneCreate.length);

    console.log('✅ Database inizializzato con successo!');
    console.log('\n📋 Credenziali di accesso:');
    console.log('👨‍💼 Admin: username="admin", password="password123"');
    console.log('👤 Operatore1: username="operatore1", password="password123"');
    console.log('👤 Operatore2: username="operatore2", password="password123"');
    console.log('👤 Operatore3: username="operatore3", password="password123"');
    console.log('\n🚀 Avvia il server con: npm run dev');

  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connessione database chiusa');
  }
}

// Esegui il seed
seedDatabase();