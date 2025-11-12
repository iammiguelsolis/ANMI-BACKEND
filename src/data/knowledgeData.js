const knowledgeData = [
  // --- TEMAS: ALIMENTOS RICOS EN HIERRO ---
  {
    keywords: ['alimentos', 'hierro', 'ricos', 'cuales', 'anemia', 'fuentes', 'prevenir'],
    response: 'Los alimentos más ricos en hierro para bebés son de origen animal, como: \n- Sangrecita \n- Hígado de pollo o res \n- Bazo \n- Pescado oscuro (como el bonito) \n- Carnes rojas (como la de res)',
    ageMinMonths: 6,
    ageMaxMonths: 120,
  },
  // --- SANGRECITA ---
  {
    keywords: ['sangrecita', 'preparar', 'cocinar', 'como'],
    response: 'Para un bebé de 6 a 7 meses, puedes sancochar la sangrecita, aplastarla bien con un tenedor hasta hacerla puré y mezclarla con su papilla de verduras. Asegúrate de que esté bien cocida.',
    ageMinMonths: 6,
    ageMaxMonths: 7,
  },
  {
    keywords: ['sangrecita', 'preparar', 'cocinar', 'como'],
    response: 'Para un bebé de 8 meses a más, puedes preparar la sangrecita guisada o salteada con un poquito de aceite y cebolla. Pícala en trocitos muy pequeños o desmenuzada para que pueda masticarla.',
    ageMinMonths: 8,
    ageMaxMonths: 120,
  },
  // --- HÍGADO --- (Este es el que falló)
  {
    keywords: ['higado', 'pollo', 'preparar', 'cocinar', 'como'],
    response: 'El hígado de pollo es excelente. Sancóchalo bien y luego aplástalo con un tenedor. Puedes mezclar una cucharada de este puré de hígado con la papilla de zapallo o camote de tu bebé.',
    ageMinMonths: 6,
    ageMaxMonths: 7,
  },
  {
    keywords: ['higado', 'pollo', 'preparar', 'cocinar', 'como'],
    response: 'Para un bebé de 8 meses a más, puedes sancochar el hígado y dárselo en trocitos pequeños que pueda coger con su mano (BLW) o picado finamente en su comida.',
    ageMinMonths: 8,
    ageMaxMonths: 120,
  },
  // --- LENTEJAS ---
  {
    keywords: ['lentejas', 'lentejitas', 'bebe', 'hierro', 'anemia', 'menestras'],
    response: '¡Las lentejas son una gran fuente de hierro vegetal! Para que tu bebé absorba mejor el hierro, acompáñalas con alimentos ricos en Vitamina C, como un chorrito de limón (si tiene más de 8 meses) o dándole de postre una papilla de naranja.',
    ageMinMonths: 6,
    ageMaxMonths: 120,
  },
  // --- QUINUA ---
  {
    keywords: ['quinua', 'quinoa', 'hierro', 'anemia'],
    response: 'La quinua es un súper alimento. Puedes prepararla en papillas o mazamorras para tu bebé. Aunque tiene hierro, es bueno mezclarla con otros alimentos como la sangrecita para potenciar la nutrición.',
    ageMinMonths: 6,
    ageMaxMonths: 120,
  },

  // --- TEMAS: ANEMIA Y PREVENCIÓN ---
  {
    // Esta es la que falló en el 'hola que tal'
    keywords: ['anemia', 'definicion', 'que es anemia'],
    response: 'La anemia es una condición en la que el cuerpo no tiene suficientes glóbulos rojos sanos para transportar oxígeno. En los bebés, la causa más común es la falta de hierro en su alimentación.',
    ageMinMonths: 0,
    ageMaxMonths: 120,
  },
  {
    keywords: ['prevenir', 'prevencion', 'anemia', 'evitar'],
    response: 'La mejor forma de prevenir la anemia es asegurando que tu bebé consuma alimentos ricos en hierro todos los días, especialmente carnes rojas, hígado, sangrecita y pescado, junto con frutas y verduras.',
    ageMinMonths: 6,
    ageMaxMonths: 120,
  },
  {
    keywords: ['signos', 'sintomas', 'anemia', 'identifica', 'detectar'],
    response: 'Un bebé con anemia puede verse pálido, estar desganado, tener poco apetito o cansarse fácilmente. Sin embargo, la única forma de saberlo con seguridad es con un exámen de sangre (dosaje de hemoglobina) indicado por un pediatra.',
    ageMinMonths: 0,
    ageMaxMonths: 120,
  },

  // --- TEMAS: SALIDAS DE EMERGENCIA Y LÍMITES ---
  {
    keywords: ['fiebre', 'vomito', 'no come', 'diarrea', 'emergencia', 'grave', 'enfermo'],
    response: 'Si tu bebé tiene fiebre alta, vómitos, diarrea o no quiere comer, esto podría ser una señal de emergencia. Mi información no puede ayudarte con esto. Por favor, busca atención médica de inmediato.',
    ageMinMonths: 0,
    ageMaxMonths: 120,
  },
  {
    keywords: ['dosis', 'cantidad', 'cuanto', 'gramos', 'proporcion', 'porciones'],
    response: 'No estoy capacitado para darte proporciones exactas o dietas personalizadas. La cantidad de comida depende del peso y edad de tu bebé. Esa información debe dártela exclusivamente un pediatra o nutricionista.',
    ageMinMonths: 0,
    ageMaxMonths: 120,
  },
  {
    keywords: ['medicina', 'pastilla', 'jarabe', 'suplemento', 'sulfato', 'ferroso'],
    response: 'No puedo recetar ni dar opinión sobre medicamentos o suplementos de hierro. La automedicación es peligrosa. Solo un profesional de la salud puede recetarle un tratamiento a tu bebé.',
    ageMinMonths: 0,
    ageMaxMonths: 120,
  },
  
  // --- TEMAS: SALUDOS Y CONVERSACIÓN ---
  {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'saludos', 'hi', 'buen dia'],
    response: '¡Hola! Soy ANMI, tu asistente nutricional. Estoy aquí para darte información verificada sobre cómo prevenir la anemia en tu bebé. ¿En qué te puedo ayudar?',
    ageMinMonths: 0,
    ageMaxMonths: 120,
  },
  {
    keywords: ['gracias', 'adios', 'chao', 'excelente', 'muchas gracias', 'bye'],
    response: '¡De nada! Ha sido un placer ayudarte. Recuerda siempre consultar con un profesional de la salud. ¡Vuelve pronto!',
    ageMinMonths: 0,
    ageMaxMonths: 120,
  },
];

module.exports = knowledgeData;