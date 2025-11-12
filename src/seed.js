require('dotenv').config();
const { sequelize, KnowledgeBase } = require('./models');
const knowledgeData = require('./data/knowledgeData');

async function seedDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    console.log('Borrando datos antiguos de KnowledgeBase...');
    await KnowledgeBase.destroy({ where: {}, truncate: true });
    console.log('✅ Datos antiguos borrados.');

    console.log('Insertando nueva información...');
    await KnowledgeBase.bulkCreate(knowledgeData);
    console.log(`✅ ¡Se insertaron ${knowledgeData.length} registros en KnowledgeBase!`);

  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:', error);
  } finally {
    await sequelize.close();
    console.log('Conexión cerrada.');
  }
}

seedDatabase();