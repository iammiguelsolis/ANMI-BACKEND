const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['passwordHash'] },
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado, token inválido.' });
      }
      
      next();

    } catch (error) {
      console.error('Error de autenticación:', error);
      res.status(401).json({ message: 'No autorizado, el token falló.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no se encontró token.' });
  }
};

module.exports = { protect };