const mongoose = require('mongoose');

// Connessione al database
mongoose.connect('mongodb://localhost:27017/automando', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schema Ordini
const ordineSchema = new mongoose.Schema({
  numero: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  cliente: { 
    type: String, 
    required: true,
    trim: true
  },
  descrizione: { 
    type: String,
    trim: true
  },
  dataConsegna: { 
    type: Date, 
    required: true 
  },
  indirizzo: {
    via: String,
    citta: String,
    cap: String,
    provincia: String
  },
  priorita: { 
    type: String, 
    enum: ['BASSA', 'MEDIA', 'ALTA', 'URGENTE'], 
    default: 'MEDIA' 
  },
  stato: { 
    type: String, 
    enum: ['BOZZA', 'ASSEGNATO', 'IN_CORSO', 'COMPLETATO', 'ANNULLATO'], 
    default: 'BOZZA' 
  },
  prodotti: [{
    nome: { type: String, required: true, trim: true },
    quantita: { type: Number, required: true, min: 0 },
    unita: { type: String, default: 'pz', trim: true },
    prezzo: { type: Number, min: 0 },
    note: { type: String, trim: true }
  }],
  attivo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Schema RDT
const rdtSchema = new mongoose.Schema({
  numero: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  cliente: { 
    type: String, 
    required: true,
    trim: true
  },
  dataConsegna: { 
    type: Date, 
    required: true 
  },
  priorita: { 
    type: String, 
    enum: ['BASSA', 'MEDIA', 'ALTA', 'URGENTE'], 
    default: 'MEDIA' 
  },
  stato: { 
    type: String, 
    enum: ['BOZZA', 'ASSEGNATO', 'IN_CORSO', 'COMPLETATO', 'ANNULLATO'], 
    default: 'BOZZA' 
  },
  prodotti: [{
    nome: { type: String, required: true, trim: true },
    quantita: { type: Number, required: true, min: 0 },
    unita: { type: String, default: 'pz', trim: true },
    prezzo: { type: Number, min: 0 },
    note: { type: String, trim: true }
  }],
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Ordine = mongoose.model('Ordine', ordineSchema, 'ordines');
const RDT = mongoose.model('RDT', rdtSchema, 'rdts');

async function createTestData() {
  try {
    console.log('🔄 Creazione dati di test...');

    // Elimina dati esistenti
    await Ordine.deleteMany({});
    await RDT.deleteMany({});

    // Crea ordini di test
    const ordini = [
      {
        numero: 'ORD-2025-001',
        cliente: 'Acme Corporation',
        descrizione: 'Ordine materiali ufficio',
        dataConsegna: new Date('2025-01-15'),
        indirizzo: {
          via: 'Via Roma 123',
          citta: 'Milano',
          cap: '20100',
          provincia: 'MI'
        },
        priorita: 'ALTA',
        stato: 'BOZZA',
        prodotti: [
          {
            nome: 'Viti M6x20',
            quantita: 100,
            unita: 'pz',
            prezzo: 0.15,
            note: 'Acciaio inox'
          },
          {
            nome: 'Rondelle Ø6',
            quantita: 200,
            unita: 'pz',
            prezzo: 0.05,
            note: 'Acciaio zincato'
          }
        ]
      },
      {
        numero: 'ORD-2025-002',
        cliente: 'Beta Industries',
        descrizione: 'Fornitura attrezzature',
        dataConsegna: new Date('2025-01-20'),
        indirizzo: {
          via: 'Corso Venezia 45',
          citta: 'Roma',
          cap: '00187',
          provincia: 'RM'
        },
        priorita: 'MEDIA',
        stato: 'ASSEGNATO',
        prodotti: [
          {
            nome: 'Bulloni M8x30',
            quantita: 50,
            unita: 'pz',
            prezzo: 0.25,
            note: 'Testa esagonale'
          }
        ]
      },
      {
        numero: 'ORD-2025-003',
        cliente: 'Gamma Solutions',
        descrizione: 'Materiali di consumo',
        dataConsegna: new Date('2025-01-25'),
        indirizzo: {
          via: 'Via Torino 78',
          citta: 'Napoli',
          cap: '80100',
          provincia: 'NA'
        },
        priorita: 'URGENTE',
        stato: 'COMPLETATO',
        prodotti: [
          {
            nome: 'Dadi M8',
            quantita: 75,
            unita: 'pz',
            prezzo: 0.10,
            note: 'Autobloccanti'
          },
          {
            nome: 'Guarnizioni',
            quantita: 30,
            unita: 'pz',
            prezzo: 0.80,
            note: 'NBR 70 Shore'
          }
        ]
      }
    ];

    // Crea RDT di test
    const rdts = [
      {
        numero: 'RDT-2025-001',
        cliente: 'Delta Logistics',
        dataConsegna: new Date('2025-01-18'),
        priorita: 'MEDIA',
        stato: 'BOZZA',
        prodotti: [
          {
            nome: 'Spine cilindriche',
            quantita: 120,
            unita: 'pz',
            prezzo: 0.18
          }
        ]
      },
      {
        numero: 'RDT-2025-002',
        cliente: 'Epsilon Services',
        dataConsegna: new Date('2025-01-22'),
        priorita: 'ALTA',
        stato: 'COMPLETATO',
        prodotti: [
          {
            nome: 'Molle di compressione',
            quantita: 85,
            unita: 'pz',
            prezzo: 1.20
          },
          {
            nome: 'Cuscinetti 608',
            quantita: 40,
            unita: 'pz',
            prezzo: 2.50
          }
        ]
      },
      {
        numero: 'RDT-2025-003',
        cliente: 'Zeta Group',
        dataConsegna: new Date('2025-01-28'),
        priorita: 'BASSA',
        stato: 'ANNULLATO',
        prodotti: [
          {
            nome: 'Anelli elastici',
            quantita: 200,
            unita: 'pz',
            prezzo: 0.08
          }
        ]
      }
    ];

    // Inserisci nel database
    const createdOrdini = await Ordine.insertMany(ordini);
    const createdRdt = await RDT.insertMany(rdts);

    console.log('✅ Dati di test creati con successo!');
    console.log(`📦 Ordini creati: ${createdOrdini.length}`);
    console.log(`📋 RDT creati: ${createdRdt.length}`);

    // Mostra i dati creati
    console.log('\n📋 Ordini:');
    createdOrdini.forEach(ordine => {
      console.log(`  - ${ordine.numero}: ${ordine.cliente} (${ordine.stato})`);
    });

    console.log('\n📋 RDT:');
    createdRdt.forEach(rdt => {
      console.log(`  - ${rdt.numero}: ${rdt.cliente} (${rdt.stato})`);
    });

  } catch (error) {
    console.error('❌ Errore nella creazione dati di test:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData();