 // commands/pp.js
import { downloadMediaMessage } from 'baileys';
import sharp from 'sharp';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const targetMsg = quoted?.imageMessage || message.message.imageMessage;
    if (!targetMsg) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Répondez à une image ou envoyez une image avec la commande.'
        }, { quoted: message });
    }
    try {
        const buffer = await downloadMediaMessage({ message: quoted }, "buffer");
        const imageBuffer = await sharp(buffer).resize(256, 256).toFormat('png').toBuffer();
        await client.updateProfilePicture(client.user.id, imageBuffer);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ✅ Photo de profil mise à jour.'
        }, { quoted: message });
    } catch (err) {
        console.error(err);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Échec de la mise à jour.'
        }, { quoted: message });
    }
}

export default execute;