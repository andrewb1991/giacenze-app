#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/giacenze";

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

const settimanaSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  anno: { type: Number, required: true },
  dataInizio: { type: Date, required: true },
  dataFine: { type: Date, required: true },
  attiva: { type: Boolean, default: true }
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
  isGlobale: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Settimana = mongoose.model('Settimana', settimanaSchema);
const GiacenzaUtente = mongoose.model('GiacenzaUtente', giacenzaUtenteSchema);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

async function resetGiacenzeOperatore() {
  try {
    console.log('🔄 Connessione al database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connesso al database');

    console.log('🗑️  Eliminazione giacenze operatore esistenti...');
    const deleteResult = await GiacenzaUtente.deleteMany({});
    console.log(`✅ Eliminate ${deleteResult.deletedCount} giacenze esistenti`);

    console.log('📦 Recupero dati di base...');
    const users = await User.find({ attivo: { $ne: false } });
    const products = await Product.find({ attivo: { $ne: false } });
    const settimane = await Settimana.find({ attiva: { $ne: false } });

    if (users.length === 0) {
      throw new Error('❌ Nessun utente trovato nel database');
    }

    if (products.length === 0) {
      throw new Error('❌ Nessun prodotto trovato nel database');
    }

    console.log(`📊 Trovati ${users.length} utenti, ${products.length} prodotti, ${settimane.length} settimane`);

    console.log('🎲 Generazione giacenze casuali...');
    
    const giacenzeToCreate = [];
    let giacenzeCount = 0;

    for (const user of users) {
      const numProdottiPerUtente = randomInt(3, Math.min(8, products.length));
      const prodottiSelezionati = products
        .sort(() => 0.5 - Math.random())
        .slice(0, numProdottiPerUtente);

      console.log(`👤 Creando giacenze per utente: ${user.username} (${numProdottiPerUtente} prodotti)`);

      for (const product of prodottiSelezionati) {
        const quantitaAssegnata = randomInt(5, 100);
        const percentualeDisponibile = randomFloat(0.3, 1.0);
        const quantitaDisponibile = Math.floor(quantitaAssegnata * percentualeDisponibile);
        const quantitaMinima = randomInt(1, Math.floor(quantitaAssegnata * 0.2));

        const settimanaId = null;

        const adminUser = users.find(u => u.role === 'admin') || users[0];

        const note = Math.random() > 0.7 
          ? ['Giacenza iniziale', 'Ricarica periodica', 'Stock di emergenza', 'Assegnazione speciale'][randomInt(0, 3)]
          : '';

        const giacenza = {
          userId: user._id,
          productId: product._id,
          settimanaId: settimanaId,
          quantitaAssegnata: quantitaAssegnata,
          quantitaDisponibile: quantitaDisponibile,
          quantitaMinima: quantitaMinima,
          dataAssegnazione: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
          assegnatoDa: adminUser._id,
          note: note,
          attiva: true,
          isGlobale: true
        };

        giacenzeToCreate.push(giacenza);
        giacenzeCount++;

        if (giacenzeCount % 50 === 0) {
          console.log(`   📈 Generate ${giacenzeCount} giacenze...`);
        }
      }
    }

    console.log('💾 Inserimento giacenze nel database...');
    const createdGiacenze = await GiacenzaUtente.insertMany(giacenzeToCreate);
    
    console.log('\n🎉 RESET COMPLETATO!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Giacenze eliminate: ${deleteResult.deletedCount}`);
    console.log(`✅ Nuove giacenze create: ${createdGiacenze.length}`);
    console.log(`👥 Utenti coinvolti: ${users.length}`);
    console.log(`📦 Prodotti coinvolti: ${products.length}`);
    
    console.log('\n📊 STATISTICHE GENERATE:');
    console.log('═══════════════════════════════════════');
    
    const stats = await GiacenzaUtente.aggregate([
      {
        $group: {
          _id: null,
          totalAssegnata: { $sum: '$quantitaAssegnata' },
          totalDisponibile: { $sum: '$quantitaDisponibile' },
          avgAssegnata: { $avg: '$quantitaAssegnata' },
          avgDisponibile: { $avg: '$quantitaDisponibile' },
          minAssegnata: { $min: '$quantitaAssegnata' },
          maxAssegnata: { $max: '$quantitaAssegnata' }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log(`📈 Quantità totale assegnata: ${stat.totalAssegnata}`);
      console.log(`📊 Quantità totale disponibile: ${stat.totalDisponibile}`);
      console.log(`🎯 Media quantità assegnata: ${Math.round(stat.avgAssegnata)}`);
      console.log(`📋 Media quantità disponibile: ${Math.round(stat.avgDisponibile)}`);
      console.log(`⬇️  Min quantità assegnata: ${stat.minAssegnata}`);
      console.log(`⬆️  Max quantità assegnata: ${stat.maxAssegnata}`);
    }

    const giacenzeGlobali = await GiacenzaUtente.countDocuments({ isGlobale: true });
    const giacenzeConSettimana = await GiacenzaUtente.countDocuments({ settimanaId: { $ne: null } });
    
    console.log(`🌍 Giacenze globali: ${giacenzeGlobali}`);
    console.log(`📅 Giacenze con settimana: ${giacenzeConSettimana}`);
    console.log(`📝 Giacenze con note: ${await GiacenzaUtente.countDocuments({ note: { $ne: '' } })}`);

    console.log('\n✨ Script completato con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante il reset delle giacenze:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnessione dal database completata');
  }
}

if (require.main === module) {
  resetGiacenzeOperatore().catch(console.error);
}

module.exports = { resetGiacenzeOperatore };