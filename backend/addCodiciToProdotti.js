// Script per aggiungere codici automatici ai prodotti esistenti
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/giacenze";

// Schema prodotto
const productSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  codice: { type: String, trim: true },
  descrizione: String,
  unita: { type: String, default: 'pz' },
  categoria: String,
  attivo: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function addCodiciToProdotti() {
  try {
    console.log('🔌 Connessione a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connesso a MongoDB');

    // Trova tutti i prodotti senza codice
    const prodottiSenzaCodice = await Product.find({
      $or: [
        { codice: { $exists: false } },
        { codice: '' },
        { codice: null }
      ]
    });

    console.log(`\n📦 Trovati ${prodottiSenzaCodice.length} prodotti senza codice`);

    if (prodottiSenzaCodice.length === 0) {
      console.log('✅ Tutti i prodotti hanno già un codice!');
      process.exit(0);
    }

    // Genera codici automatici
    let counter = 1;
    const updates = [];

    for (const prodotto of prodottiSenzaCodice) {
      // Genera codice basato sulla categoria
      const categoriaAbbr = prodotto.categoria
        ? prodotto.categoria.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '')
        : 'PRD';

      const codiceGenerato = `${categoriaAbbr}-${String(counter).padStart(3, '0')}`;

      console.log(`  → ${prodotto.nome}: ${codiceGenerato}`);

      updates.push({
        updateOne: {
          filter: { _id: prodotto._id },
          update: { $set: { codice: codiceGenerato } }
        }
      });

      counter++;
    }

    // Esegui bulk update
    if (updates.length > 0) {
      console.log('\n⏳ Aggiornamento prodotti in corso...');
      const result = await Product.bulkWrite(updates);
      console.log(`✅ ${result.modifiedCount} prodotti aggiornati con successo!`);
    }

    // Mostra riepilogo
    console.log('\n📊 Riepilogo:');
    const prodottiConCodice = await Product.countDocuments({
      codice: { $exists: true, $ne: '', $ne: null }
    });
    const totaleProdotti = await Product.countDocuments();
    console.log(`  Prodotti con codice: ${prodottiConCodice}/${totaleProdotti}`);

  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnesso da MongoDB');
    process.exit(0);
  }
}

// Esegui lo script
console.log('🚀 Script di aggiunta codici prodotti\n');
addCodiciToProdotti();
