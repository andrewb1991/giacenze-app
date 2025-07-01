📚 Fase 5: Documentazione Aggiuntiva
Crea docs/setup.md
markdown# 🛠️ Setup Completo

## Prerequisiti
- Node.js 16+
- MongoDB
- npm o yarn

## Installazione Backend

1. Vai nella cartella backend:
```bash
cd backend
npm install

Configura variabili ambiente (.env):

MONGODB_URI=mongodb://localhost:27017/giacenze
JWT_SECRET=your-super-secret-key
PORT=7070

Avvia server:

bashnpm start
Installazione Frontend

Vai nella cartella frontend:

bashcd frontend
npm install

Avvia app React:

bashnpm start
Database
Il sistema crea automaticamente dati di test al primo avvio.
Credenziali Default:

Admin: admin / password123
Operatore: operatore1 / password123

Struttura Database

Users (utenti e admin)
Products (catalogo prodotti)
GiacenzeUtente (giacenze personali)
Utilizzi (storico consumi)
Assegnazioni (settimane operative)


---

## 🏷️ **Fase 6: Tag e Release (Opzionale)**

### **1. Crea Tag per Prima Versione**
```bash
git tag -a v1.0.0 -m "🎉 Release v1.0.0 - Sistema Gestione Giacenze

✨ Features:
- Gestione giacenze multi-utente
- Dashboard admin completo
- Report Excel avanzati
- Autenticazione JWT
- Responsive design"
