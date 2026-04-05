// commands/online.js
export async function presence(message, client, state) {
    const remoteJid = message.key.remoteJid;
    if (!state) return;
    // Envoi de la présence en ligne
    client.sendPresenceUpdate('available');
}

export default presence;