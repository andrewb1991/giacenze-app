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
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantita: Number,
    note: String
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
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantita: Number,
    note: String
  }],
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Ordine = mongoose.model('Ordine', ordineSchema);
const RDT = mongoose.model('RDT', rdtSchema);

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
        prodotti: []
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
        prodotti: []
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
        stato: 'IN_CORSO',
        prodotti: []
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
        prodotti: []
      },
      {
        numero: 'RDT-2025-002',
        cliente: 'Epsilon Services',
        dataConsegna: new Date('2025-01-22'),
        priorita: 'ALTA',
        stato: 'COMPLETATO',
        prodotti: []
      },
      {
        numero: 'RDT-2025-003',
        cliente: 'Zeta Group',
        dataConsegna: new Date('2025-01-28'),
        priorita: 'BASSA',
        stato: 'ANNULLATO',
        prodotti: []
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