 // commands/take.js
import { downloadMediaMessage } from 'baileys';
import webp from 'node-webpmux';
import crypto from 'crypto';

export const name = 'take';
export const description = 'Modifie le pack et l\'auteur d\'un sticker.';
export const usage = '.take [nouveau pack] (en répondant à un sticker)';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    const contextInfo = message.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = contextInfo?.quotedMessage;

    if (!quotedMsg?.stickerMessage) {
        await client.sendMessage(remoteJid, { 
            text: '> `Makima m-dx :` ❌ Réponds à un sticker avec .take <nom du pack>'
        });
        return;
    }

    await client.sendMessage(remoteJid, { 
        text: '> `Makima m-dx :` ⏳ Adaptation du sticker...'
    });

    let pack = '𝙱𝚈 𝚃𝙷𝙴 𝙳𝙰𝚁𝙺𝙽𝙴𝚂𝚂';
    let author = message.pushName || '𝙼𝙾𝙸 𝙼𝙰𝙺𝙸𝙼𝙰 𝚂𝚄𝙸𝚂 𝙹𝙴 𝙼𝙴𝙲𝙷𝙰𝙽𝚃𝙴?🌹';
    if (args && args.length > 0) {
        pack = args.join(' ');
        author = pack;
    }

    try {
        // Télécharger le sticker original
        const stickerBuffer = await downloadMediaMessage(
            { message: quotedMsg },
            'buffer',
            {},
            { logger: console, reuploadRequest: client.updateMediaMessage }
        );

        if (!stickerBuffer) {
            throw new Error('Échec du téléchargement du sticker');
        }

        const img = new webp.Image();
        await img.load(stickerBuffer);

        const json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': pack,
            'sticker-pack-publisher': author,
            'emojis': ['🤖']
        };

        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);

        img.exif = exif;
        const finalBuffer = await img.save(null);

        await client.sendMessage(remoteJid, { sticker: finalBuffer });
    } catch (error) {
        console.error('Erreur take :', error);
        await client.sendMessage(remoteJid, { 
            text: '> `Makima m-dx :` ❌ Erreur lors de la modification du sticker.'
        });
    }
}