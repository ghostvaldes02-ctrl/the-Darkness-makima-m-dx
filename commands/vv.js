 // commands/vv.js
import { normalizeMessageContent } from '../utils/normalizeContent.js';
import { downloadMediaMessage } from 'baileys';
import fs from 'fs';
import path from 'path';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function execute(message, client) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Répondez à un message view‑once.'
        });
    }

    const isViewOnce = quoted?.imageMessage?.viewOnce ||
                       quoted?.videoMessage?.viewOnce ||
                       quoted?.audioMessage?.viewOnce;

    if (!isViewOnce) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Le message cité n’est pas à vue unique.'
        });
    }

    await sendWithContext(client, remoteJid, {
        text: '> `Makima m-dx :` ⏳ Récupération en cours...'
    });

    const content = normalizeMessageContent(quoted);
    function modifyViewOnce(obj) {
        if (typeof obj !== 'object' || obj === null) return;
        for (const key in obj) {
            if (key === 'viewOnce') obj[key] = false;
            else if (typeof obj[key] === 'object') modifyViewOnce(obj[key]);
        }
    }
    modifyViewOnce(content);

    try {
        const successMsg = '> `Makima m-dx :` ✅ Vue unique récupérée.';

        if (content?.imageMessage) {
            const buffer = await downloadMediaMessage({ message: content }, 'buffer', {});
            const temp = path.resolve('./temp_vo.jpg');
            fs.writeFileSync(temp, buffer);
            await client.sendMessage(remoteJid, { image: { url: temp }, caption: successMsg });
            fs.unlinkSync(temp);
        } else if (content?.videoMessage) {
            const buffer = await downloadMediaMessage({ message: content }, 'buffer', {});
            const temp = path.resolve('./temp_vo.mp4');
            fs.writeFileSync(temp, buffer);
            await client.sendMessage(remoteJid, { video: { url: temp }, caption: successMsg });
            fs.unlinkSync(temp);
        } else if (content?.audioMessage) {
            const buffer = await downloadMediaMessage({ message: content }, 'buffer', {});
            const temp = path.resolve('./temp_vo.mp3');
            fs.writeFileSync(temp, buffer);
            await client.sendMessage(remoteJid, { audio: { url: temp }, mimetype: 'audio/mp4', ptt: false });
            await client.sendMessage(remoteJid, { text: successMsg });
            fs.unlinkSync(temp);
        } else {
            throw new Error('Aucun média valide');
        }
    } catch (error) {
        console.error('Erreur vv :', error);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Erreur lors du traitement.'
        });
    }
}

export default { execute };