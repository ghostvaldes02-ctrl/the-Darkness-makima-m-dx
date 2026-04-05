// commands/media.js
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadMediaMessage } from 'baileys';
import { sendWithContext } from '../utils/sendWithContext.js';

const execAsync = promisify(exec);

export async function photo(message, client) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.stickerMessage) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Répondez à un sticker.'
        });
    }

    try {
        const buffer = await downloadMediaMessage({ message: quoted, client }, "buffer");
        const filename = `./temp/sticker-${Date.now()}.png`;
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
        fs.writeFileSync(filename, buffer);
        await client.sendMessage(remoteJid, {
            image: fs.readFileSync(filename),
            caption: '> `Makima m-dx :` ✅ Sticker converti en image.'
        });
        fs.unlinkSync(filename);
    } catch (e) {
        console.error(e);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Erreur lors de la conversion.'
        });
    }
}

export async function tomp3(message, client) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.videoMessage) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Répondez à une vidéo.'
        });
    }

    try {
        const buffer = await downloadMediaMessage({ message: quoted, client }, "buffer");
        const inputPath = `./temp/video-${Date.now()}.mp4`;
        const outputPath = `./temp/audio-${Date.now()}.mp3`;
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
        fs.writeFileSync(inputPath, buffer);
        await execAsync(`ffmpeg -i ${inputPath} -vn -ab 128k -ar 44100 -y ${outputPath}`);
        await client.sendMessage(remoteJid, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mp4',
            ptt: false
        });
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ✅ Vidéo convertie en audio.'
        });
    } catch (e) {
        console.error(e);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Erreur lors de la conversion.'
        });
    }
}

export default { photo, tomp3 };