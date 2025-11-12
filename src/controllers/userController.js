const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); 

// 1. --- REGISTRO DE USUARIO ---
exports.register = async (req, res) => {
  try {
    const { username, password, babyAgeMonths } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'El usuario y la contraseña son requeridos.' });
    }

    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ese nombre de usuario ya está en uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username,
      passwordHash: passwordHash,
      babyAgeMonths: babyAgeMonths || null,
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      userId: newUser.id,
      username: newUser.username,
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


// 2. --- LOGIN DE USUARIO ---
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;


    if (!username || !password) {
      return res.status(400).json({ message: 'El usuario y la contraseña son requeridos.' });
    }


    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }


    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,               
      { expiresIn: '24h' }                      
    );

    // Enviar la respuesta con el token
    res.status(200).json({
      message: 'Login exitoso.',
      token: token,
      username: user.username,
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};