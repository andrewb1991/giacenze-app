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

// Funzione per calcolare lunedì e venerdì di una settimana
function getWeekDates(year, weekNumber) {
  // Calcola il primo giorno dell'anno
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Trova il primo lunedì dell'anno
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

async function updateWeeks() {
  try {
    console.log('📅 Aggiornando settimane esistenti con date corrette...');
    
    // Cancella tutte le settimane esistenti
    await Settimana.deleteMany({});
    console.log('🗑️  Settimane esistenti cancellate');
    
    // Crea nuove settimane con date corrette
    const settimane = [];
    const currentYear = new Date().getFullYear();
    
    // Crea settimane per l'anno corrente e quello successivo
    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let weekNumber = 1; weekNumber <= 52; weekNumber++) {
        const { monday, friday } = getWeekDates(year, weekNumber);
        
        // Solo se la settimana ha senso (non troppo nel futuro)
        if (monday.getFullYear() <= currentYear + 1) {
          settimane.push({
            numero: weekNumber,
            anno: year,
            dataInizio: monday,
            dataFine: friday,
            attiva: true
          });
        }
      }
    }
    
    // Inserisci le nuove settimane
    const settimaneCreate = await Settimana.insertMany(settimane);
    console.log('✅ Settimane create:', settimaneCreate.length);
    
    // Mostra alcune settimane di esempio
    console.log('\n📋 Esempi di settimane create:');
    const esempi = settimaneCreate.slice(0, 5);
    esempi.forEach(settimana => {
      const dataInizio = settimana.dataInizio.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
      const dataFine = settimana.dataFine.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
      console.log(`   ${dataInizio} - ${dataFine} ${settimana.anno} (Settimana ${settimana.numero})`);
    });
    
    console.log('\n🎉 Aggiornamento completato!');
    console.log('💡 Ora le settimane verranno mostrate con il formato: "22/06 - 26/06 2025"');
    
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connessione database chiusa');
    process.exit(0);
  }
}

// Funzione per testare il formato
function testFormat() {
  console.log('\n🧪 Test formattazione date:');
  
  const esempi = [
    { anno: 2025, numero: 1 },
    { anno: 2025, numero: 25 },
    { anno: 2025, numero: 52 }
  ];
  
  esempi.forEach(({ anno, numero }) => {
    const { monday, friday } = getWeekDates(anno, numero);
    const formatDate = (date) => date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    console.log(`   Settimana ${numero}/${anno}: ${formatDate(monday)} - ${formatDate(friday)} ${anno}`);
  });
}

// Esegui test e aggiornamento
console.log('🔄 Avviando aggiornamento settimane...');
testFormat();
updateWeeks();