const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('KnowledgeBase', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ageMinMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ageMaxMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 120,
    },
  }, {
    tableName: 'KnowledgeBase',
    timestamps: false,
  });
};