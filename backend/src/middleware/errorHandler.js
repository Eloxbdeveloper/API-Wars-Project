const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Ocurrió un error interno en el servidor.';

  // Mostrar traza solo en entornos que no sean producción/test cuando sea un error de servidor real
  if (statusCode === 500) {
    console.error('💥 Error 500 en servidor:', err);
  }

  return res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorHandler;