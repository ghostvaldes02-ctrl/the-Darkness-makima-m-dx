// utils/normalizeContent.js

/**
 * Normalise le contenu d'un message pour gérer les messages à vue unique.
 * Extrait le message réel depuis viewOnceMessageV2 s'il existe.
 * @param {Object} message - Le message à normaliser
 * @returns {Object} - Le contenu normalisé du message
 */
export const normalizeMessageContent = (message) => {
    if (!message) return null;
    const content = message.viewOnceMessageV2?.message || message;
    return content;
};

export default normalizeMessageContent;
