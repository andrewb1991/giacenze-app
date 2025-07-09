// src/config/config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:7070/api',
    NODE_ENV: 'development'
  },
  production: {
    API_BASE_URL: 'https://giacenze-app-production.up.railway.app/api',
    NODE_ENV: 'production'
  }
};

// Determina l'ambiente corrente
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Esporta la configurazione per l'ambiente corrente
export default config[environment];

// Export anche per debug
export { config };