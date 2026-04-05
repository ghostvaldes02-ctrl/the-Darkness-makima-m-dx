 // commands/save.js
import { normalizeMessageContent } from '../utils/normalizeContent.js';
import { downloadMediaMessage } from 'baileys';
import fs from 'fs';
import path from 'path';

export async function execute(message, client) {
    const remoteJid = message.key.remoteJid;
    const bot = client.user.id.split(':')[0] + '@s.whatsapp.net';

    const contextInfo = message.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;
    const quotedId = contextInfo?.stanzaId;
    const quotedJid = contextInfo?.participant || remoteJid;

    const isViewOnce = quotedMessage?.imageMessage?.viewOnce ||
                       quotedMessage?.videoMessage?.viewOnce ||
                       quotedMessage?.audioMessage?.viewOnce;

    try {
        if (!isViewOnce) {
            const forwardableMessage = {
                key: { remoteJid: quotedJid, fromMe: false, id: quotedId },
                message: quotedMessage
            };
            await client.sendMessage(bot, { forward: forwardableMessage });
            await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _Message sauvegardé  ✨_' });
            return;
        }

        const content = normalizeMessageContent(quotedMessage);

        function modifyViewOnce(obj) {
            if (typeof obj !== 'object' || obj === null) return;
            for (const key in obj) {
                if (key === 'viewOnce') obj[key] = false;
                else if (typeof obj[key] === 'object') modifyViewOnce(obj[key]);
            }
        }
        modifyViewOnce(content);

        let filePath = '';
        let sendOptions = {};

        if (content?.imageMessage) {
            filePath = './temp_vo_image.jpg';
            sendOptions = { image: { url: filePath } };
        } else if (content?.videoMessage) {
            filePath = './temp_vo_video.mp4';
            sendOptions = { video: { url: filePath } };
        } else if (content?.audioMessage) {
            filePath = './temp_vo_audio.mp3';
            sendOptions = { audio: { url: filePath } };
        } else {
            return await client.sendMessage(remoteJid, { text: '_Aucun média supporté trouvé dans ce message à vue unique._' });
        }

        const buffer = await downloadMediaMessage({ message: content }, 'buffer', {});
        if (!buffer) {
            return await client.sendMessage(remoteJid, { text: '_Échec du téléchargement du message à vue unique._' });
        }

        fs.writeFileSync(filePath, buffer);
        await client.sendMessage(bot, sendOptions);
        fs.unlinkSync(filePath);

        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _Message sauvegardé ☑️_' });

    } catch (err) {
        console.error('Erreur dans save :', err);
        await client.sendMessage(remoteJid, { text: '_Une erreur est survenue lors du traitement du message à vue unique._' });
    }
}

export default { execute };