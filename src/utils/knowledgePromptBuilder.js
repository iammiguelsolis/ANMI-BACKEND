const knowledgeData = require("../data/knowledgeData");

function buildKnowledgeInstruction(message, babyAge) {
  const text = message.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let instructions = "";

  for (const item of knowledgeData) {
    const match = item.keywords.some(kw =>
      text.includes(kw.toLowerCase())
    );

    const ageOK = babyAge >= item.ageMinMonths && babyAge <= item.ageMaxMonths;

    if (match && ageOK) {
      instructions += `
Si el mensaje del usuario contiene estas palabras: [${item.keywords.join(", ")}]
Entonces debes responder utilizando este contenido oficial:
"${item.response}"
De lo contrario, puedes ignorar este contenido. Y seguir respondiendo normalmente pero con el contexto debido.
`;
    }
  }

  return instructions.trim() || null;
}

module.exports = { buildKnowledgeInstruction };
