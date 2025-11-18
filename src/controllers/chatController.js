const { ChatSession, Message, KnowledgeBase, User } = require('../models');
const { Op } = require('sequelize');

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getBotResponse(userMessage, userId, chatId) {
  try {
    const user = await User.findByPk(userId);
    const babyAge = user.babyAgeMonths || 0;

    const knowledgeData = await KnowledgeBase.findAll();

    // 1️⃣ Detectar emergencias
    if (isEmergencyMessage(userMessage)) {
      return "Si tu bebé tiene fiebre alta, vómitos, diarrea o no quiere comer, esto podría ser una señal de emergencia. Mi información no puede ayudarte con esto. Por favor, busca atención médica de inmediato.";
    }

    // 2️⃣ Buscar coincidencia en la base
    const matched = searchKnowledgeBase(userMessage, babyAge, knowledgeData);

    if (matched) {
      return matched + `
---
Recuerda: Esta información es referencial y no reemplaza la consulta y evaluación personalizada con un pediatra o nutricionista.
`;
    }

    // 3️⃣ Si no encuentra, usar IA (pero restringida)
    const systemPrompt = `
Eres ANMI, Asistente Nutricional Materno Infantil.

REGLAS:
- Si no existe coincidencia en la base de conocimiento, solo puedes responder con información general de nutrición infantil (no médica).
- No inventes información técnica.
- El objetivo es combatir la anemia infantil.
- Siempre incluye el disclaimer al final.

BASE DE CONOCIMIENTO DISPONIBLE:
${knowledgeData.map(k => `- Keywords: ${k.keywords.join(', ')} → Respuesta: ${k.response} (Edad ${k.ageMinMonths}-${k.ageMaxMonths})`).join('\n')}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    });

    return completion.choices[0].message.content + `
---
Recuerda: Esta información es referencial y no reemplaza la consulta y evaluación personalizada con un pediatra o nutricionista.
`;

  } catch (err) {
    console.error("Error IA:", err);
    return "Ocurrió un error procesando tu solicitud. Inténtalo nuevamente.";
  }
}

exports.createChatSession = async (req, res) => {
  try {
    const newChat = await ChatSession.create({
      userId: req.user.id,
      title: (req.body && req.body.title) || 'Nuevo Chat',
    });
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el chat.', error: error.message });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const chats = await ChatSession.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener chats.', error: error.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await ChatSession.findOne({ where: { id: chatId, userId: req.user.id }});
    if (!chat) {
      return res.status(404).json({ message: 'Chat no encontrado o no te pertenece.' });
    }

    const messages = await Message.findAll({
      where: { chatSessionId: chatId },
      order: [['createdAt', 'ASC']],
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes.', error: error.message });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { content } = req.body;

    const chat = await ChatSession.findOne({ where: { id: chatId, userId: req.user.id }});
    if (!chat) {
      return res.status(404).json({ message: 'Chat no encontrado o no te pertenece.' });
    }

    await Message.create({
      chatSessionId: chatId,
      sender: 'USER',
      content: content,
    });

    const botResponseContent = await getBotResponse(content, req.user.id, chatId);

    const botMessage = await Message.create({
      chatSessionId: chatId,
      sender: 'BOT',
      content: botResponseContent,
    });

    res.status(201).json(botMessage);

  } catch (error) {
    console.error('Error al postear mensaje:', error);
    res.status(500).json({ message: 'Error al enviar el mensaje.', error: error.message });
  }
};