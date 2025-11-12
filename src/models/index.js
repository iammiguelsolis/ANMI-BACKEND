const { Sequelize } = require('sequelize');

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_DATABASE;
const dbPort = process.env.DB_PORT;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // necesario para Render
    },
  },
});

const User = require('./User')(sequelize);
const ChatSession = require('./ChatSession')(sequelize);
const Message = require('./Message')(sequelize);
const KnowledgeBase = require('./KnowledgeBase')(sequelize);

// Relaciones
User.hasMany(ChatSession, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
ChatSession.belongsTo(User, {
  foreignKey: 'userId',
});

ChatSession.hasMany(Message, {
  foreignKey: 'chatSessionId',
  onDelete: 'CASCADE',
});
Message.belongsTo(ChatSession, {
  foreignKey: 'chatSessionId',
});

module.exports = {
  sequelize,
  User,
  ChatSession,
  Message,
  KnowledgeBase,
};
