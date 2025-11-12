const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ChatSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Nuevo Chat',
    },
  }, {
    tableName: 'ChatSession',
    timestamps: true,
    updatedAt: false,
    createdAt: 'createdAt',
  });
};