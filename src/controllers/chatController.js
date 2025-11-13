const { ChatSession, Message, KnowledgeBase, User } = require('../models');
const { Op } = require('sequelize');

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getBotResponse(userMessage, userId, chatId) {
  try {
    
    const user = await User.findByPk(userId);
    const babyAge = user.babyAgeMonths || 'edad no especificada';

    const dbHistoryMessages = await Message.findAll({
      where: { chatSessionId: chatId },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });
    const allKnowledge = await KnowledgeBase.findAll();
    const formattedKnowledge = allKnowledge.map(entry => {
      return `- Si la pregunta trata sobre [${entry.keywords.join(', ')}], responde con: "${entry.response}" (Rango de edad: ${entry.ageMinMonths}-${entry.ageMaxMonths} meses)\n`;
    }).join('\n---\n');

    
    const systemPrompt = `
# ROL Y PERSONALIDAD
Eres "ANMI" (Asistente Nutricional Materno Infantil). Actúas COMO UN NUTRICIONISTA PEDIÁTRICO experto. Eres amigable, empático, profesional y tu objetivo es combatir la anemia infantil.

# CONTEXTO DEL USUARIO ACTUAL
- Edad del bebé: ${babyAge} meses.

# REGLAS ÉTICAS FUNDAMENTALES (¡OBLIGATORIO CUMPLIR!)
1.  **PRIORIDAD DE EMERGENCIA:** Si el usuario menciona síntomas graves (fiebre, vómitos, diarrea, no come, decaído, etc.), TU ÚNICA RESPUESTA debe ser: "Si tu bebé tiene fiebre alta, vómitos, diarrea o no quiere comer, esto podría ser una señal de emergencia. Mi información no puede ayudarte con esto. Por favor, busca atención médica de inmediato."
2.  **ACTÚA COMO NUTRICIONISTA:** El usuario quiere que le des consejos, dietas y proporciones. PUEDES y DEBES hacerlo, ya que eres el experto.
3.  **EL DISCLAIMER ES OBLIGATORIO:** Al final de CADA RESPUESTA que generes, DEBES añadir estas líneas exactas:
    ---
    Recuerda: Esta información es referencial y no reemplaza la consulta y evaluación personalizada con un pediatra o nutricionista.

# BASE DE CONOCIMIENTO (Prioriza esta información)
Usa esta información verificada (basada en MINSA/OMS) como tu fuente principal de verdad:
---
${formattedKnowledge}
---
`;

    const messagesForAPI = [
      { role: 'system', content: systemPrompt }
    ];

    dbHistoryMessages.forEach(msg => {
      if (msg.sender === 'USER') {
        messagesForAPI.push({ role: 'user', content: msg.content });
      } else {
        messagesForAPI.push({ role: 'assistant', content: msg.content });
      }
    });

    messagesForAPI.push({ role: 'user', content: userMessage });
    
    console.log("[IA Logic] Enviando prompt a OpenAI (ChatGPT)...");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messagesForAPI,
    });

    const text = completion.choices[0].message.content;
    
    return text;

  } catch (error) {
    console.error("Error al contactar a la IA Generativa (OpenAI):", error);
    return "Lo siento, tuve un problema al procesar tu solicitud. La IA no pudo responder.";
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