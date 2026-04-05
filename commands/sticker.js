 // commands/sticker.js
import { downloadMediaMessage } from 'baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import webp from 'node-webpmux';
import crypto from 'crypto';

export const name = 'sticker';
export const description = 'Crée un sticker à partir d\'une image ou d\'une vidéo.';
export const usage = '.sticker [nom du pack] (en répondant à une image/vidéo)';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMsg) {
        await client.sendMessage(remoteJid, { 
            text: '> `Makima m-dx :` ❌ Réponds à une image ou une vidéo avec .sticker, ou envoie une image/vidéo avec .sticker en légende.'
        });
        return;
    }

    const mediaMessage = quotedMsg.imageMessage || quotedMsg.videoMessage || quotedMsg.documentMessage;
    if (!mediaMessage) {
        await client.sendMessage(remoteJid, { 
            text: '> `Makima m-dx :` ❌ Le message cité n’est pas une image ou une vidéo.'
        });
        return;
    }

    await client.sendMessage(remoteJid, { 
        text: '> `Makima m-dx :` ⏳ Transformation en cours...'
    });

    try {
        // Télécharger le média
        const mediaBuffer = await downloadMediaMessage(
            { message: quotedMsg },
            'buffer',
            {},
            { logger: console, reuploadRequest: client.updateMediaMessage }
        );

        if (!mediaBuffer) {
            throw new Error('Échec du téléchargement');
        }

        // Déterminer pack et auteur
        let pack = '𝑩𝒚';
        let author = message.pushName || '𝙼𝙰𝙺𝙸𝙼𝙰 𝙼-𝙳𝚇';
        if (args && args.length > 0) {
            pack = args.join(' ');
            author = pack;
        }

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const tempInput = path.join(tmpDir, `temp_${Date.now()}`);
        const tempOutput = path.join(tmpDir, `sticker_${Date.now()}.webp`);
        fs.writeFileSync(tempInput, mediaBuffer);

        const isVideo = !!quotedMsg.videoMessage;
        const isGif = mediaMessage.mimetype?.includes('gif') || (isVideo && mediaMessage.seconds <= 5);
        const isAnimated = isVideo && !isGif; // vidéo longue → sticker animé

        let ffmpegCommand;
        if (isVideo && !isGif) {
            // Sticker animé (vidéo courte)
            ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
        } else {
            // Image ou GIF court → sticker statique
            ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
        }

        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        let webpBuffer = fs.readFileSync(tempOutput);

        // Ajout des métadonnées
        const img = new webp.Image();
        await img.load(webpBuffer);
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

        // Nettoyage
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
    } catch (error) {
        console.error('Erreur sticker:', error);
        await client.sendMessage(remoteJid, { 
            text: '> `Makima m-dx :` ❌ Échec de la création du sticker. Assurez-vous que ffmpeg est installé et que le fichier est valide.'
        });
    }
}