// commands/img.js
import axios from 'axios';
import { OWNER_NAME } from '../config.js';
import { sendWithContext } from '../utils/sendWithContext.js';

const GOOGLE_API_KEY = "AIzaSyDo09jHOJqL6boMeac-xmPHB-yD9dKOKGU";
const GOOGLE_CX = 'd1a5b18a0be544a0e';

async function searchImages(query, num = 5) {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                q: query,
                cx: GOOGLE_CX,
                searchType: 'image',
                key: GOOGLE_API_KEY,
                num: Math.min(num, 10)
            }
        });
        return response.data.items?.map(item => item.link) || [];
    } catch (error) {
        console.error('Erreur recherche images:', error);
        return null;
    }
}

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid) return;

    // Si args est vide, on essaie de parser le message original
    if (!args || args.length === 0) {
        const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const parts = messageBody.trim().split(/\s+/);
        const newArgs = parts.slice(1);
        if (newArgs.length) return execute(message, client, newArgs);
        else return sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` ❌ Aucun sujet spécifié. Exemple : .img chat 5' });
    }

    let numImages = 5;
    let query;
    const lastArg = args[args.length - 1];
    const parsed = parseInt(lastArg);
    if (!isNaN(parsed) && parsed > 0) {
        numImages = Math.min(parsed, 10);
        query = args.slice(0, -1).join(' ');
    } else {
        query = args.join(' ');
    }

    await sendWithContext(client, remoteJid, {
        text: `> \`Makima m-dx :\` 🔎 Recherche de ${numImages} image(s) pour "${query}"...`
    });

    const urls = await searchImages(query, numImages);
    if (!urls) {
        return sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` ❌ Erreur lors de la recherche.' });
    }
    if (!urls.length) {
        return sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` 🎎 Aucune image trouvée.' });
    }

    let sent = 0;
    for (let i = 0; i < urls.length; i++) {
        try {
            const response = await axios.get(urls[i], { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            await client.sendMessage(remoteJid, {
                image: buffer,
                caption: `> \`Makima m-dx :\` 🖼 Image ${i+1}/${urls.length}`
            });
            sent++;
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (e) {
            console.error(`Erreur téléchargement image ${i}:`, e.message);
        }
    }
    if (sent === 0) {
        await sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` ❌ Aucune image n’a pu être téléchargée.' });
    }
}

export default { execute };