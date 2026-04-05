// commands/song.js
import axios from 'axios';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendWithContext } from '../utils/sendWithContext.js';
import { toAudio } from '../utils/converter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getYupraDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await axios.get(apiUrl, { timeout: 60000 });
    if (res.data?.success && res.data?.data?.download_url) {
        return {
            download: res.data.data.download_url,
            title: res.data.data.title,
            thumbnail: res.data.data.thumbnail
        };
    }
    throw new Error('Yupra failed');
}

async function getOkatsuDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await axios.get(apiUrl, { timeout: 15000 });
    if (res.data?.dl) {
        return {
            download: res.data.dl,
            title: res.data.title,
            thumbnail: res.data.thumb
        };
    }
    throw new Error('Okatsu failed');
}

export async function songCommand(sock, chatId, message, args) {
    const query = args.join(' ');
    if (!query) {
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : 🎵 *Usage :* .song <titre ou lien YouTube>'
        });
        return;
    }

    try {
        let video;
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            video = { url: query };
        } else {
            const search = await yts(query);
            if (!search?.videos?.length) {
                await sendWithContext(sock, chatId, {
                    text: '> Makima m-dx : ❌ Aucun résultat trouvé.'
                });
                return;
            }
            video = search.videos[0];
        }

        // Envoi du message de téléchargement
        await sendWithContext(sock, chatId, {
            image: { url: video.thumbnail },
            caption: `> Makima m-dx : ⏳ *Téléchargement en cours...*\n🎵 *${video.title}*\n⏱ Durée : ${video.timestamp}`
        });

        let audioData;
        try {
            audioData = await getYupraDownloadByUrl(video.url);
        } catch {
            audioData = await getOkatsuDownloadByUrl(video.url);
        }

        const audioUrl = audioData.download;
        const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 90000 });
        let audioBuffer = Buffer.from(audioResponse.data);

        // Conversion en MP3 si nécessaire
        let finalBuffer = audioBuffer;
        let finalMimetype = 'audio/mpeg';
        let finalExtension = 'mp3';

        // Détection simple du format
        const isMp3 = audioBuffer.slice(0, 3).toString('ascii') === 'ID3' || (audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0);
        if (!isMp3) {
            try {
                finalBuffer = await toAudio(audioBuffer, 'm4a');
            } catch (convErr) {
                console.error('Conversion error:', convErr);
            }
        }

        await sock.sendMessage(chatId, {
            audio: finalBuffer,
            mimetype: finalMimetype,
            fileName: `${(audioData.title || video.title).replace(/[^a-z0-9]/gi, '_')}.${finalExtension}`,
            ptt: false
        });
    } catch (error) {
        console.error('Erreur song:', error);
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : ❌ Échec du téléchargement. Réessaie plus tard.'
        });
    }
}

export default {
    name: 'song',
    execute: songCommand
};