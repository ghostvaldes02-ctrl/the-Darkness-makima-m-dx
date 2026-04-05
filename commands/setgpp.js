// commands/setgpp.js
import { downloadContentFromMessage } from 'baileys';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;

    if (!remoteJid.endsWith('@g.us')) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ⚠️ Cette commande doit être utilisée dans un groupe.'
        });
    }

    const contextInfo = message.message?.extendedTextMessage?.contextInfo;
    if (!contextInfo || !contextInfo.quotedMessage?.imageMessage) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ⚠️ Réponds à une image pour changer la photo du groupe.'
        });
    }

    try {
        const quoted = contextInfo.quotedMessage.imageMessage;
        const stream = await downloadContentFromMessage(quoted, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        await client.updateProfilePicture(remoteJid, buffer);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ✅ Photo de profil du groupe mise à jour.'
        });
    } catch (err) {
        console.error('❌ Erreur setgpp :', err);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Impossible de changer la photo du groupe.'
        });
    }
}

export default { execute };