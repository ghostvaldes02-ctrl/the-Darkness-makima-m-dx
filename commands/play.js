 // commands/play.js
import axios from 'axios';
import { OWNER_NAME } from '../config.js';

const API_KEY = "AIzaSyDV11sdmCCdyyToNU-XRFMbKgAA4IEDOS0";
const FASTAPI_URL = "https://api.danscot.dev/api";

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    const title = args.join(' ');
    if (!title) {
        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` ❌ Veuillez fournir un titre de vidéo.' });
        return;
    }

    try {
        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` 🔍 Recherche...' });

        const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
        const { data: searchData } = await axios.get(searchUrl, {
            params: {
                part: "snippet",
                q: title,
                type: "video",
                maxResults: 1,
                key: API_KEY,
            },
        });

        if (!searchData.items || searchData.items.length === 0) throw new Error("Aucune vidéo trouvée.");

        const video = searchData.items[0];
        const videoId = video.id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const videoTitle = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.high.url;

        const apiUrl = `${FASTAPI_URL}/youtube/downl/?url=${encodeURIComponent(videoUrl)}&fmt=mp3`;
        const { data } = await axios.get(apiUrl);
        if (data.status !== 'ok' || !data.results?.download_url) throw new Error('Échec de l’obtention de l’audio.');

        const downloadUrl = data.results.download_url;

        await client.sendMessage(remoteJid, {
            image: { url: thumbnail },
            caption: `> \`Makima m-dx :\` 🎵 *${videoTitle}*\n\n> 🔗 ${videoUrl}\n\n> 📥 Téléchargement...\n\n> Powered By ${OWNER_NAME} Tech`
        });

        await client.sendMessage(remoteJid, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${videoTitle}.mp3`,
            ptt: false
        });
    } catch (err) {
        console.error('Erreur play:', err);
        await client.sendMessage(remoteJid, { text: `> \`Makima m-dx :\` ❌ Échec : ${err.message}` });
    }
}

export default execute;