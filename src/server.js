require('dotenv').config();
const app = require('./app');

const { sequelize } = require('./models/index');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida.');

    await sequelize.sync(); 
    console.log('✅ Modelos sincronizados con la base de datos (tablas creadas).');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ No se pudo conectar/sincronizar la base de datos:', error);
  }
}

startServer();