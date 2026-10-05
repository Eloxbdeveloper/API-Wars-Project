const env = require('../../config/env');

// Gestión del OAuth2 de Factus
let accessToken = null;
let tokenExpiration = null;

exports.getToken = async () => {
  // Si el token existe y es válido, se retorna
  // Si no, se autentica usando las variables en `env.FACTUS`
  throw new Error("OAuth no implementado aún (Fase 4)");
};
