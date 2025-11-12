const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de ANMI!');
});

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

module.exports = app;