const { ChatSession, Message, User } = require('../models');
const { buildKnowledgeInstruction } = require('../utils/knowledgePromptBuilder');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getBotResponse(userMessage, userId, chatId) {
  try {
    const user = await User.findByPk(userId);
    const babyAge = user?.babyAgeMonths || 0;

    // Historial de chat (últimos 20 mensajes)
    const dbHistoryMessages = await Message.findAll({
      where: { chatSessionId: chatId },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    // Obtener instrucciones desde knowledgeData basadas en keywords
    const knowledgeInstructions = buildKnowledgeInstruction(userMessage, babyAge);

    // Palabras de emergencia
    const emergencyKeywords = ["fiebre", "vomito", "vómito", "diarrea", "letargo", "convulsion", "convulsión", "no quiere comer"];
    const isEmergency = emergencyKeywords.some(kw =>
      userMessage.toLowerCase().includes(kw)
    );

    if (isEmergency) {
      return "Si tu bebé tiene fiebre alta, vómitos, diarrea o no quiere comer, esto podría ser una señal de emergencia. Mi información no puede ayudarte con esto. Por favor, busca atención médica de inmediato.";
    }

    // ---------- PROMPT PRINCIPAL ----------
    let systemPrompt = `
Eres ANMI, un asistente cálido especializado en nutrición infantil y prevención de anemia.
SOLAMENTE RESPONDE PREGUNTAS RELACIONADAS CON NUTRICIÓN INFANTIL Y PREVENCIÓN DE ANEMIA.
Reglas estrictas:
- NO USES MARCADORES DE TEXTOS
- NO USES **
- NO USES *
- NO uses nada de Markdown.
- NO USES NADA DE **MARKDOWN**.
- NO inventes datos nuevos.
- Usa emojis siempre.
- No des diagnósticos.
- Edad del bebé: ${babyAge} meses.

Si existen instrucciones oficiales desde la base de conocimientos, DEBES seguirlas exactamente.
    `;

    if (knowledgeInstructions) {
      systemPrompt += `
Instrucciones oficiales encontradas:
${knowledgeInstructions}
      `;
    } else {
      systemPrompt += `
No se encontraron coincidencias de conocimiento. Responde igual con tono cálido, dentro del dominio de nutrición infantil, sin inventar información médica.
      `;
    }

    // ---------- Construcción del historial ----------
    const messagesForAPI = [{ role: "system", content: systemPrompt }];

    dbHistoryMessages.forEach(msg => {
      messagesForAPI.push({
        role: msg.sender === "USER" ? "user" : "assistant",
        content: msg.content
      });
    });

    messagesForAPI.push({ role: "user", content: userMessage });

    // ---------- Llamada al modelo ----------
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForAPI,
    });
    
    console.log("User: ", userMessage);
    console.log("Bot: ", + completion.choices[0].message.content);

    let finalResponse = completion.choices[0].message.content;

    // Agregar mensaje de seguridad siempre al final
    finalResponse += "\n\nRecuerda que esta información no reemplaza la evaluación de un médico. Si notas algo preocupante, consulta con un profesional de salud. 🩺";

    return finalResponse;

  } catch (error) {
    console.error("Error IA:", error);
    return "Hubo un problema procesando tu solicitud.";
  }
}

// ------------------------------
// CONTROLADORES
// ------------------------------

exports.createChatSession = async (req, res) => {
  try {
    const newChat = await ChatSession.create({
      userId: req.user.id,
      title: req.body?.title || "Nuevo Chat",
    });
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: "Error al crear chat.", error: error.message });
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
    res.status(500).json({ message: "Error al obtener chats.", error: error.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await ChatSession.findOne({
      where: { id: chatId, userId: req.user.id },
    });
    if (!chat) return res.status(404).json({ message: "Chat no encontrado." });

    const messages = await Message.findAll({
      where: { chatSessionId: chatId },
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener mensajes.", error: error.message });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { content } = req.body;

    const chat = await ChatSession.findOne({
      where: { id: chatId, userId: req.user.id },
    });
    if (!chat) return res.status(404).json({ message: "Chat no encontrado." });

    await Message.create({
      chatSessionId: chatId,
      sender: "USER",
      content,
    });

    const botResponseContent = await getBotResponse(content, req.user.id, chatId);

    const botMessage = await Message.create({
      chatSessionId: chatId,
      sender: "BOT",
      content: botResponseContent,
    });

    res.status(201).json(botMessage);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ message: "Error al enviar.", error: error.message });
  }
};
