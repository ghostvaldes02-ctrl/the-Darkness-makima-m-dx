 // commands/video.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OWNER_NAME } from '../config.js';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;

    // Vérifier que args est un tableau et contient une URL
    if (!args || !Array.isArray(args) || args.length === 0) {
        await client.sendMessage(remoteJid, {
            text: '> `Makima m-dx :` ❌ Veuillez fournir une URL valide.\nExemple : .video https://example.com/video.mp4'
        });
        return;
    }

    const url = args[0];
    if (!url || !url.startsWith('http')) {
        await client.sendMessage(remoteJid, {
            text: '> `Makima m-dx :` ❌ Veuillez fournir une URL valide (commençant par http/https).'
        });
        return;
    }

    try {
        await client.sendMessage(remoteJid, {
            text: '> `Makima m-dx :` 🔍 Traitement de la vidéo...'
        });

        const response = await axios.post(
            'https://downloader-api-7mul.onrender.com/api/download',
            { url },
            { responseType: 'json' }
        );

        const downloadLink = response.data.filepath;
        const videoTitle = response.data.title || 'Video';
        const thumbnail = response.data.thumbnail;

        const fileName = `${uuidv4()}.mp4`;
        const filePath = path.join(process.cwd(), 'temp', fileName);
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

        const videoResponse = await axios.get(downloadLink, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await client.sendMessage(remoteJid, {
            image: { url: thumbnail },
            caption: `> \`Makima m-dx :\` 🎥 *${videoTitle}*\n\n> 🔗 ${url}\n\n> 📥 Envoi de la vidéo...\n\n> Powered By ${OWNER_NAME} Tech`
        });

        await client.sendMessage(remoteJid, { video: { url: filePath } });
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error('Erreur video :', err);
        await client.sendMessage(remoteJid, {
            text: `> \`Makima m-dx :\` ❌ Échec du téléchargement : ${err.message}`
        });
    }
}

export default execute;