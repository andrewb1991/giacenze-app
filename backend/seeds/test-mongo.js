// test-mongo.js - Test rapido connessione MongoDB
const mongoose = require('mongoose');

async function testMongoDB() {
  console.log('🔍 Testando connessione MongoDB...\n');
  
  // Test 1: Connessione base
  try {
    console.log('1️⃣ Tentativo connessione...');
    
    const connection = await mongoose.connect('mongodb://localhost:27017/automando/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 secondi timeout
      connectTimeoutMS: 5000
    });
    
    console.log('✅ Connessione riuscita!');
    console.log(`   Database: ${connection.connection.db.databaseName}`);
    console.log(`   Host: ${connection.connection.host}:${connection.connection.port}`);
    
    // Test 2: Operazione semplice
    console.log('\n2️⃣ Test operazione database...');
    
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', TestSchema);
    
    // Prova a inserire un documento
    const doc = await TestModel.create({ name: 'test' });
    console.log('✅ Inserimento riuscito:', doc._id);
    
    // Prova a leggerlo
    const found = await TestModel.findById(doc._id);
    console.log('✅ Lettura riuscita:', found.name);
    
    // Pulisci
    await TestModel.deleteMany({});
    console.log('✅ Pulizia completata');
    
    console.log('\n🎉 MongoDB funziona perfettamente!');
    console.log('🚀 Ora puoi eseguire il seed: node seeds/seed.js');
    
  } catch (error) {
    console.log('\n❌ ERRORE MongoDB:');
    console.log(`   Tipo: ${error.name}`);
    console.log(`   Messaggio: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 SOLUZIONE:');
      console.log('   MongoDB non è in esecuzione. Avvialo con:');
      console.log('   • brew services start mongodb-community');
      console.log('   • oppure: docker run -d -p 27017:27017 mongo:latest');
    }
    
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n🔧 SOLUZIONE:');
      console.log('   Problema di risoluzione hostname.');
      console.log('   Prova con: mongodb://127.0.0.1:27017');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connessione chiusa');
    process.exit(0);
  }
}

// Esegui test
testMongoDB();