const mongoose = require('mongoose');

// Connessione MongoDB
mongoose.connect('mongodb+srv://andreabramucci:qWREkLZknWIxlawS@automando.fwkavbr.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const settimanaSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  anno: { type: Number, required: true },
  dataInizio: { type: Date, required: true },
  dataFine: { type: Date, required: true },
  attiva: { type: Boolean, default: true }
}, { timestamps: true });

const Settimana = mongoose.model('Settimana', settimanaSchema);

// Configurazione anni - MODIFICA QUESTI VALORI PER AGGIUNGERE PIÙ ANNI
const CONFIG = {
  // Anni per cui generare le settimane
  years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],
  
  // Opzioni
  clearExistingWeeks: true, // Set false per aggiungere senza cancellare
  weeksPerYear: 52,        // Numero di settimane per anno
  
  // Database
  deleteBeforeInsert: true
};

// Funzione per calcolare lunedì e venerdì di una settimana ISO
function getWeekDates(year, weekNumber) {
  // Calcola il primo giorno dell'anno
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Trova il primo lunedì dell'anno (ISO week date)
  const dayOfWeek = firstDayOfYear.getDay(); // 0 = domenica, 1 = lunedì
  let daysUntilMonday;
  
  if (dayOfWeek === 0) { // Domenica
    daysUntilMonday = 1;
  } else if (dayOfWeek === 1) { // Lunedì
    daysUntilMonday = 0;
  } else { // Martedì-Sabato
    daysUntilMonday = 8 - dayOfWeek;
  }
  
  const firstMonday = new Date(firstDayOfYear);
  firstMonday.setDate(firstDayOfYear.getDate() + daysUntilMonday);
  
  // Calcola il lunedì della settimana richiesta
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
  
  // Calcola il venerdì della stessa settimana
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  
  return { monday, friday };
}

// Funzione per generare settimane per un singolo anno
function generateWeeksForYear(year) {
  const weeks = [];
  
  for (let weekNumber = 1; weekNumber <= CONFIG.weeksPerYear; weekNumber++) {
    const { monday, friday } = getWeekDates(year, weekNumber);
    
    weeks.push({
      numero: weekNumber,
      anno: year,
      dataInizio: monday,
      dataFine: friday,
      attiva: true
    });
  }
  
  return weeks;
}

// Funzione principale
async function generateWeeks() {
  try {
    console.log('🚀 Avviando generazione settimane...');
    console.log(`📅 Anni configurati: ${CONFIG.years.join(', ')}`);
    console.log(`⚙️  Settimane per anno: ${CONFIG.weeksPerYear}`);
    
    // Cancella settimane esistenti se richiesto
    if (CONFIG.clearExistingWeeks) {
      console.log('\n🗑️  Cancellazione settimane esistenti...');
      const deleted = await Settimana.deleteMany({});
      console.log(`   Cancellate: ${deleted.deletedCount} settimane`);
    }
    
    // Genera tutte le settimane
    const allWeeks = [];
    
    console.log('\n📅 Generazione settimane per anno:');
    for (let year of CONFIG.years) {
      const weeksForYear = generateWeeksForYear(year);
      allWeeks.push(...weeksForYear);
      console.log(`   ${year}: ${weeksForYear.length} settimane generate`);
    }
    
    console.log(`\n💾 Inserimento di ${allWeeks.length} settimane nel database...`);
    
    // Inserisci tutte le settimane
    const insertedWeeks = await Settimana.insertMany(allWeeks);
    console.log(`✅ Inserite: ${insertedWeeks.length} settimane`);
    
    // Statistiche finali
    console.log('\n📊 Riepilogo settimane per anno:');
    for (let year of CONFIG.years) {
      const count = insertedWeeks.filter(w => w.anno === year).length;
      console.log(`   ${year}: ${count} settimane`);
    }
    
    // Esempi di settimane create
    console.log('\n🔍 Esempi di settimane create:');
    const examples = [
      CONFIG.years[0],                    // Primo anno
      CONFIG.years[Math.floor(CONFIG.years.length / 2)], // Anno di mezzo
      CONFIG.years[CONFIG.years.length - 1]              // Ultimo anno
    ];
    
    examples.forEach(year => {
      const week = insertedWeeks.find(w => w.anno === year && w.numero === 1);
      if (week) {
        const start = week.dataInizio.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        const end = week.dataFine.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        console.log(`   ${year}: ${start} - ${end} ${year} (Settimana 1)`);
      }
    });
    
    console.log('\n🎉 Generazione completata con successo!');
    console.log(`💡 Database aggiornato con settimane per ${CONFIG.years.length} anni`);
    console.log(`📈 Totale settimane disponibili: ${insertedWeeks.length}`);
    
  } catch (error) {
    console.error('❌ Errore durante la generazione:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connessione database chiusa');
    process.exit(0);
  }
}

// Funzione per verificare la configurazione
function validateConfig() {
  console.log('\n🔧 Validazione configurazione:');
  
  if (!CONFIG.years || CONFIG.years.length === 0) {
    throw new Error('Configurazione anni non valida');
  }
  
  if (CONFIG.weeksPerYear < 1 || CONFIG.weeksPerYear > 53) {
    throw new Error('Numero settimane per anno non valido (1-53)');
  }
  
  const totalWeeks = CONFIG.years.length * CONFIG.weeksPerYear;
  console.log(`   ✅ Anni: ${CONFIG.years.length}`);
  console.log(`   ✅ Settimane per anno: ${CONFIG.weeksPerYear}`);
  console.log(`   ✅ Totale settimane: ${totalWeeks}`);
  
  if (totalWeeks > 1000) {
    console.log(`   ⚠️  Attenzione: ${totalWeeks} settimane è un numero elevato`);
  }
}

// Avvio script
console.log('🗓️  GENERATORE SETTIMANE AUTOMANDO');
console.log('=====================================');

try {
  validateConfig();
  generateWeeks();
} catch (error) {
  console.error('❌ Errore di configurazione:', error.message);
  process.exit(1);
}