 // commands/url.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { OWNER_NAME } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Répondez à une image, vidéo, audio ou document.'
        }, { quoted: message });
    }

    let fileId = null;
    if (quoted.imageMessage) fileId = quoted.imageMessage.url;
    else if (quoted.videoMessage) fileId = quoted.videoMessage.url;
    else if (quoted.audioMessage) fileId = quoted.audioMessage.url;
    else if (quoted.documentMessage) fileId = quoted.documentMessage.url;
    else {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Type de fichier non supporté.'
        }, { quoted: message });
    }

    try {
        const response = await axios({ url: fileId, method: 'GET', responseType: 'stream' });
        const ext = path.extname(fileId) || '.bin';
        const fileName = `${uuidv4()}${ext}`;
        const filePath = path.join(process.cwd(), 'temp', fileName);
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.createReadStream(filePath));
        const upload = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
        fs.unlinkSync(filePath);
        await sendWithContext(client, remoteJid, {
            text: `> \`Makima m-dx :\` ✅ Fichier converti :\n${upload.data}\n\n> Powered By ${OWNER_NAME} Tech`
        }, { quoted: message });
    } catch (err) {
        console.error(err);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Erreur lors de l’upload.'
        }, { quoted: message });
    }
}

export default execute;