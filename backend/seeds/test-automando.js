// resetDatabase.js - Script per resettare e ripopolare il database
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connessione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/giacenze';

// Schema definitions (copiati dal server principale)
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

const giacenzaUtenteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  settimanaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settimana' },
  quantitaAssegnata: { type: Number, required: true, default: 0 },
  quantitaDisponibile: { type: Number, required: true, default: 0 },
  quantitaMinima: { type: Number, required: true, default: 0 },
  dataAssegnazione: { type: Date, default: Date.now },
  assegnatoDa: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  attiva: { type: Boolean, default: true },
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
  mezzoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mezzo' }
}, { timestamps: true });

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

async function resetDatabase() {
  try {
    console.log('🔄 Connessione al database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connesso al database');

    // Conferma reset
    console.log('\n⚠️  ATTENZIONE: Questo script cancellerà TUTTI i dati nel database!');
    console.log('Premi Ctrl+C entro 5 secondi per annullare...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🗑️  Eliminazione dati esistenti...');
    
    // Elimina tutte le collezioni
    await User.deleteMany({});
    await Product.deleteMany({});
    await Polo.deleteMany({});
    await Mezzo.deleteMany({});
    await Settimana.deleteMany({});
    await Assegnazione.deleteMany({});
    await GiacenzaUtente.deleteMany({});
    await Utilizzo.deleteMany({});
    await RicaricaGiacenza.deleteMany({});
    
    console.log('✅ Database pulito');

    console.log('\n📝 Creazione nuovi dati di test...\n');

    // Crea utenti
    console.log('👥 Creazione utenti...');
    const adminPassword = await bcrypt.hash('password123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      username: 'admin',
      password: adminPassword,
      email: 'admin@test.com',
      role: 'admin'
    });
    console.log('   ✓ Admin creato: admin / password123');

    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        username: `operatore${i}`,
        password: userPassword,
        email: `operatore${i}@test.com`,
        role: 'user'
      });
      users.push(user);
      console.log(`   ✓ Operatore creato: operatore${i} / password123`);
    }

    // Crea prodotti
    console.log('\n📦 Creazione prodotti...');
    const prodottiData = [
      // DPI
[

  {
    nome: "V501012",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "ALIMENTATORE SWITCHING AC/DC VIN=90-264VAC 50-60Hz / VOUT=12VDC 1A 12W - 78.12.1.230.1200"
  },
  {
    nome: "V500659/V501088",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "ANTENNA ESTERNA CIRCOLARE 4G DIAM.ANT.=80MM IP67 RG174 L.CAVO=1,7MT CONN.=SMA-M - 592C_170RG174_SMA/2"
  },
  {
    nome: "V501013",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "BARRIERA ATEX A-SICUREZZA-INTRINSECA 1-CANALE ALIMENTAZIONE-12VDC - 9001/01/168/075-101"
  },
  {
    nome: "V501130",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "BARRIERA ATEX A-SICUREZZA-INTRINSECA 2-CANALI INGRESSO-DIGITALI - NPEXA-K5D11"
  },
  {
    nome: "V300408",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "BATTERIA PIOMBO AGM 12VDC 12AH STANDARD/AC CONN.=FASTON-MASCHIO-6,3MM 150MMX98MMX97MM 3,93KG - 00412121"
  },
  {
    nome: "V500660",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "CAVO COASSIALE D'ANTENNA CONN.=UFL-FEMMINA/SMA-FEMMINA [DA PANNELLO] LUNGH.CAVO=190MM - MHFSMAFIP68190"
  },
  {
    nome: "V600407",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "G2P-CBX ALIMENTATORE/CARICABATTERIE ATEX II (2)G [Ex ib Gb] IIB Tamb: -20C/+60C (Vout=7V2 Iout=100mA)"
  },
  {
    nome: "V501053",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "RICAMBIO KIT MATERIALI DI ADEGUAMENTO (PER RTU TIPO-D EDIZIONE 7 - ITALGAS)"
  },
  {
    nome: "V601206",
    categoria: "manutenzioni",
    unita: "pz",
    descrizione: "RICAMBIO PACCO BATTERIA NON RICARICABILE G4PZ-PB3664 (PER PRODOTTO G4P)"
  }
]
 
];

    const products = [];
    for (const prodData of prodottiData) {
      const product = await Product.create(prodData);
      products.push(product);
    }
    console.log(`   ✓ ${products.length} prodotti creati`);

    // Crea poli
    console.log('\n📍 Creazione poli...');
    const poliData = [
      { nome: 'Polo Nord', descrizione: 'Zone: Libertà, Adriatico, Archi' },
      { nome: 'Polo Sud', descrizione: 'Zone: Baraccola, Aspio, Poggio' },
      { nome: 'Polo Centro', descrizione: 'Zone: Centro Storico, Passetto, Piazza Cavour' },
      { nome: 'Polo Est', descrizione: 'Zone: Tavernelle, Candia, Varano' },
      { nome: 'Polo Ovest', descrizione: 'Zone: Torrette, Collemarino, Palombina' }
    ];

    const poli = [];
    for (const poloData of poliData) {
      const polo = await Polo.create(poloData);
      poli.push(polo);
      console.log(`   ✓ ${polo.nome} creato`);
    }

    // Crea mezzi
    console.log('\n🚛 Creazione mezzi...');
    const mezziData = [
      { nome: 'Furgone 01', descrizione: 'Fiat Ducato - Targa: AN123AB' },
      { nome: 'Furgone 02', descrizione: 'Iveco Daily - Targa: AN456CD' },
      { nome: 'Furgone 03', descrizione: 'Mercedes Sprinter - Targa: AN789EF' },
      { nome: 'Auto 01', descrizione: 'Fiat Panda - Targa: AN012GH' },
      { nome: 'Auto 02', descrizione: 'Fiat Punto - Targa: AN345IL' },
      { nome: 'Porter 01', descrizione: 'Piaggio Porter - Targa: AN678MN' }
    ];

    const mezzi = [];
    for (const mezzoData of mezziData) {
      const mezzo = await Mezzo.create(mezzoData);
      mezzi.push(mezzo);
      console.log(`   ✓ ${mezzo.nome} creato`);
    }

    // Crea settimane (ultime 8 settimane + prossime 4)
    console.log('\n📅 Creazione settimane...');
    const settimane = [];
    const oggi = new Date();
    
    // Calcola il lunedì della settimana corrente
    const giornoSettimana = oggi.getDay() || 7; // Domenica = 7
    const lunediCorrente = new Date(oggi);
    lunediCorrente.setDate(oggi.getDate() - giornoSettimana + 1);
    lunediCorrente.setHours(0, 0, 0, 0);

    // Crea settimane passate e future
    for (let i = -8; i <= 4; i++) {
      const lunedi = new Date(lunediCorrente);
      lunedi.setDate(lunediCorrente.getDate() + (i * 7));
      
      const domenica = new Date(lunedi);
      domenica.setDate(lunedi.getDate() + 6);
      domenica.setHours(23, 59, 59, 999);
      
      // Calcola numero settimana
      const primoGennaio = new Date(lunedi.getFullYear(), 0, 1);
      const giorniDallInizio = Math.floor((lunedi - primoGennaio) / (24 * 60 * 60 * 1000));
      const numeroSettimana = Math.ceil((giorniDallInizio + primoGennaio.getDay() + 1) / 7);
      
      const settimana = await Settimana.create({
        numero: numeroSettimana,
        anno: lunedi.getFullYear(),
        dataInizio: lunedi,
        dataFine: domenica
      });
      
      settimane.push(settimana);
      
      const tipo = i < 0 ? 'passata' : i === 0 ? 'corrente' : 'futura';
      console.log(`   ✓ Settimana ${numeroSettimana}/${lunedi.getFullYear()} (${tipo}) creata`);
    }

    // Crea assegnazioni
    console.log('\n📋 Creazione assegnazioni...');
    const assegnazioni = [];
    
    // Assegna ogni operatore a diverse combinazioni polo/mezzo/settimana
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      
      // Assegna 3-4 settimane per operatore
      const numSettimane = 3 + Math.floor(Math.random() * 2);
      const settimaneIndici = [];
      
      // Seleziona settimane casuali
      while (settimaneIndici.length < numSettimane) {
        const index = Math.floor(Math.random() * settimane.length);
        if (!settimaneIndici.includes(index)) {
          settimaneIndici.push(index);
        }
      }
      
      for (const settIndex of settimaneIndici) {
        const polo = poli[Math.floor(Math.random() * poli.length)];
        const mezzo = mezzi[Math.floor(Math.random() * mezzi.length)];
        
        const assegnazione = await Assegnazione.create({
          userId: user._id,
          poloId: polo._id,
          mezzoId: mezzo._id,
          settimanaId: settimane[settIndex]._id,
          createdBy: admin._id
        });
        
        assegnazioni.push(assegnazione);
      }
    }
    console.log(`   ✓ ${assegnazioni.length} assegnazioni create`);

    // Crea giacenze
    console.log('\n📊 Creazione giacenze...');
    let giacenzeCreate = 0;
    
    for (const user of users) {
      // Giacenze globali (prodotti base per tutti)
      const prodottiBase = products.slice(0, 10); // Primi 10 prodotti
      
      for (const product of prodottiBase) {
        const quantita = Math.floor(Math.random() * 50) + 50; // 50-100
        const minima = Math.floor(quantita * 0.2); // 20% come soglia
        
        await GiacenzaUtente.create({
          userId: user._id,
          productId: product._id,
          quantitaAssegnata: quantita,
          quantitaDisponibile: quantita - Math.floor(Math.random() * 20), // Simula uso
          quantitaMinima: minima,
          assegnatoDa: admin._id,
          isGlobale: true,
          note: 'Giacenza standard'
        });
        giacenzeCreate++;
      }
      
      // Giacenze specifiche per alcune settimane
      const userAssegnazioni = assegnazioni.filter(a => a.userId.equals(user._id));
      
      for (let i = 0; i < Math.min(2, userAssegnazioni.length); i++) {
        const assegnazione = userAssegnazioni[i];
        
        // Aggiungi 3-5 prodotti extra per questa settimana
        const numProdottiExtra = 3 + Math.floor(Math.random() * 3);
        const prodottiExtra = products.slice(10).sort(() => 0.5 - Math.random()).slice(0, numProdottiExtra);
        
        for (const product of prodottiExtra) {
          const quantita = Math.floor(Math.random() * 30) + 20; // 20-50
          const minima = Math.floor(quantita * 0.25);
          
          await GiacenzaUtente.create({
            userId: user._id,
            productId: product._id,
            settimanaId: assegnazione.settimanaId,
            quantitaAssegnata: quantita,
            quantitaDisponibile: quantita,
            quantitaMinima: minima,
            assegnatoDa: admin._id,
            isGlobale: false,
            note: `Speciale per settimana ${assegnazione.settimanaId}`
          });
          giacenzeCreate++;
        }
      }
    }
    console.log(`   ✓ ${giacenzeCreate} giacenze create`);

    // Crea alcuni utilizzi di esempio
    console.log('\n📝 Creazione utilizzi di esempio...');
    let utilizziCreati = 0;
    
    for (const user of users.slice(0, 3)) { // Solo per i primi 3 operatori
      const userGiacenze = await GiacenzaUtente.find({ 
        userId: user._id, 
        quantitaDisponibile: { $gt: 5 } 
      }).limit(5);
      
      const userAssegnazioni = assegnazioni.filter(a => a.userId.equals(user._id));
      
      for (const giacenza of userGiacenze) {
        if (userAssegnazioni.length > 0) {
          const assegnazione = userAssegnazioni[0];
          const quantitaUsata = Math.floor(Math.random() * 5) + 1;
          
          if (giacenza.quantitaDisponibile >= quantitaUsata) {
            await Utilizzo.create({
              userId: user._id,
              productId: giacenza.productId,
              giacenzaUtenteId: giacenza._id,
              assegnazioneId: assegnazione._id,
              quantitaUtilizzata: quantitaUsata,
              quantitaPrimaDellUso: giacenza.quantitaDisponibile,
              quantitaRimasta: giacenza.quantitaDisponibile - quantitaUsata,
              settimanaId: assegnazione.settimanaId,
              poloId: assegnazione.poloId,
              mezzoId: assegnazione.mezzoId
            });
            
            giacenza.quantitaDisponibile -= quantitaUsata;
            await giacenza.save();
            
            utilizziCreati++;
          }
        }
      }
    }
    console.log(`   ✓ ${utilizziCreati} utilizzi di esempio creati`);

    console.log('\n✅ Database resettato e popolato con successo!\n');
    
    console.log('📊 Riepilogo dati creati:');
    console.log(`   - ${users.length + 1} utenti (1 admin + ${users.length} operatori)`);
    console.log(`   - ${products.length} prodotti`);
    console.log(`   - ${poli.length} poli`);
    console.log(`   - ${mezzi.length} mezzi`);
    console.log(`   - ${settimane.length} settimane`);
    console.log(`   - ${assegnazioni.length} assegnazioni`);
    console.log(`   - ${giacenzeCreate} giacenze`);
    console.log(`   - ${utilizziCreati} utilizzi di esempio`);
    
    console.log('\n🔐 Credenziali di accesso:');
    console.log('   Admin: admin / password123');
    for (let i = 1; i <= users.length; i++) {
      console.log(`   Operatore ${i}: operatore${i} / password123`);
    }
    
  } catch (error) {
    console.error('❌ Errore durante il reset:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnesso dal database');
    process.exit(0);
  }
}

// Esegui lo script
resetDatabase();