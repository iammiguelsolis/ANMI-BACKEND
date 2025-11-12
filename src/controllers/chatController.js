const { ChatSession, Message, KnowledgeBase, User } = require('../models');
const { Op } = require('sequelize');

// --- ¡NUEVA CONFIGURACIÓN DE IA! ---
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Lee la clave del .env
});
// --- FIN DE LA NUEVA CONFIGURACIÓN ---


/**
 * ESTA ES LA NUEVA LÓGICA DE IA GENERATIVA (con OpenAI)
 */
async function getBotResponse(userMessage, userId, chatId) {
  try {
    // 1. OBTENER CONTEXTO (USUARIO, HISTORIAL, BASE DE CONOCIMIENTO)
    
    // Contexto del Usuario
    const user = await User.findByPk(userId);
    const babyAge = user.babyAgeMonths || 'edad no especificada';

    // Contexto del Historial (Memoria)
    const dbHistoryMessages = await Message.findAll({
      where: { chatSessionId: chatId },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    // Contexto de la Base de Conocimiento (Reglas del Negocio)
    const allKnowledge = await KnowledgeBase.findAll();
    const formattedKnowledge = allKnowledge.map(entry => {
      return `- Si la pregunta trata sobre [${entry.keywords.join(', ')}], responde con: "${entry.response}" (Rango de edad: ${entry.ageMinMonths}-${entry.ageMaxMonths} meses)\n`;
    }).join('\n---\n');

    // 2. CONSTRUIR EL "MEGA-PROMPT" PARA OPENAI
    
    // Este es el "Cerebro" o "Constitución" del bot
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

    // 3. CONSTRUIR EL HISTORIAL PARA LA API
    // OpenAI funciona mejor con un historial de mensajes estructurado
    const messagesForAPI = [
      { role: 'system', content: systemPrompt }
    ];

    // Añadimos el historial de la base de datos
    dbHistoryMessages.forEach(msg => {
      if (msg.sender === 'USER') {
        messagesForAPI.push({ role: 'user', content: msg.content });
      } else {
        // Asumimos que los mensajes 'BOT' son del 'assistant'
        messagesForAPI.push({ role: 'assistant', content: msg.content });
      }
    });

    // Añadimos la nueva pregunta del usuario
    messagesForAPI.push({ role: 'user', content: userMessage });


    // 4. LLAMAR A LA IA Y DEVOLVER LA RESPUESTA
    
    console.log("[IA Logic] Enviando prompt a OpenAI (ChatGPT)...");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // El modelo más rápido y popular
      messages: messagesForAPI,
    });

    const text = completion.choices[0].message.content;
    
    return text;

  } catch (error) {
    console.error("Error al contactar a la IA Generativa (OpenAI):", error);
    return "Lo siento, tuve un problema al procesar tu solicitud. La IA no pudo responder.";
  }
}

// --- CONTROLADORES DE RUTAS (sin cambios) ---

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