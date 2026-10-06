const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { getAccessToken } = require('../src/integrations/factus/auth');

const runTest = async () => {
  console.log('🔄 Iniciando prueba de autenticación contra Factus Sandbox...');
  try {
    const token = await getAccessToken();

    if (token && typeof token === 'string' && token.length > 0) {
      console.log('FACTUS AUTH: OK');
      process.exit(0);
    } else {
      console.error('FACTUS AUTH: ERROR (Token no recibido)');
      process.exit(1);
    }
  } catch (error) {
    console.error('FACTUS AUTH: ERROR');
    console.error(`Diag: ${error.message}`);
    process.exit(1);
  }
};

runTest();