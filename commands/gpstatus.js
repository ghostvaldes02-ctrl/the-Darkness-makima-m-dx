 // commands/gpstatus.js
import { downloadContentFromMessage, prepareWAMessageMedia } from 'baileys';
import { sendWithContext } from '../utils/sendWithContext.js';

export const name = 'gpstatus';
export const description = 'Envoie un statut dans le groupe (texte, image, vidéo, audio).';
export const usage = '.gpstatus (en répondant à un message) ou .gpstatus <texte>';

function randomColor() {
    const r = Math.floor(Math.random() * 200) + 55;
    const g = Math.floor(Math.random() * 200) + 55;
    const b = Math.floor(Math.random() * 200) + 55;
    return (0xFF << 24) | (r << 16) | (g << 8) | b;
}

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ⚠️ Cette commande ne peut être utilisée que dans un groupe.'
        });
    }

    // Vérification admin supprimée – tout le monde peut poster
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let msgText = null;

    if (args.length > 0) {
        msgText = args.join(' ').trim();
    } else if (quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text) {
        msgText = quotedMsg.conversation || quotedMsg.extendedTextMessage.text;
    } else if (message.message?.conversation) {
        const raw = message.message.conversation;
        msgText = raw.replace(/^\.gpstatus\s*/i, '');
    }

    let statusPayload = null;

    if (quotedMsg?.imageMessage) {
        try {
            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            const media = await prepareWAMessageMedia({ image: buffer }, { upload: client.waUploadToServer });
            statusPayload = {
                groupStatusMessageV2: {
                    message: {
                        imageMessage: {
                            ...media.imageMessage,
                            caption: quotedMsg.imageMessage.caption || ''
                        }
                    }
                }
            };
        } catch (err) {
            console.error('Erreur téléchargement image:', err);
            return sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` ❌ Erreur lors du téléchargement de l\'image.' });
        }
    } else if (quotedMsg?.videoMessage) {
        try {
            const stream = await downloadContentFromMessage(quotedMsg.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            const media = await prepareWAMessageMedia({ video: buffer }, { upload: client.waUploadToServer });
            statusPayload = {
                groupStatusMessageV2: {
                    message: {
                        videoMessage: {
                            ...media.videoMessage,
                            caption: quotedMsg.videoMessage.caption || ''
                        }
                    }
                }
            };
        } catch (err) {
            console.error('Erreur téléchargement vidéo:', err);
            return sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` ❌ Erreur lors du téléchargement de la vidéo.' });
        }
    } else if (quotedMsg?.audioMessage) {
        try {
            const stream = await downloadContentFromMessage(quotedMsg.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            const media = await prepareWAMessageMedia({ audio: buffer }, { upload: client.waUploadToServer });
            statusPayload = {
                groupStatusMessageV2: {
                    message: {
                        audioMessage: {
                            ...media.audioMessage,
                            ptt: quotedMsg.audioMessage.ptt || false
                        }
                    }
                }
            };
        } catch (err) {
            console.error('Erreur téléchargement audio:', err);
            return sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` ❌ Erreur lors du téléchargement de l\'audio.' });
        }
    } else if (msgText) {
        const bgColor = randomColor();
        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    extendedTextMessage: {
                        text: msgText,
                        backgroundArgb: bgColor,
                        font: 1
                    }
                }
            }
        };
    }

    if (!statusPayload) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Veuillez répondre à un média ou fournir un texte.'
        });
    }

    try {
        await client.relayMessage(remoteJid, statusPayload, {});
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ✅ Statut posté avec succès !'
        });
        await client.sendMessage(remoteJid, { react: { text: '✅', key: message.key } });
    } catch (err) {
        console.error('Erreur envoi statut:', err);
        await sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` ❌ Échec de l\'envoi du statut.' });
    }
}

export default execute;