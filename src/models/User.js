const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    babyAgeMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    acceptedTermsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'User',
    timestamps: true,
    updatedAt: false,
    createdAt: 'createdAt',
  });
};