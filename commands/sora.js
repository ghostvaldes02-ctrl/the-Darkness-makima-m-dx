// commands/sora.js
import axios from 'axios';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function soraCommand(sock, chatId, message, args) {
    const prompt = args.join(' ');
    if (!prompt) {
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : 🎬 *Usage :* .sora <description de la vidéo>'
        });
        return;
    }

    try {
        await sendWithContext(sock, chatId, {
            text: `> Makima m-dx : ⏳ *Génération de la vidéo en cours...*\n📝 Prompt : ${prompt}`
        });

        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl, { timeout: 120000 });
        const videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;

        if (!videoUrl) throw new Error('No video URL');

        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `> Makima m-dx : 🎥 *Généré par IA*\nPrompt : ${prompt}`
        });
    } catch (error) {
        console.error('Erreur sora:', error);
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : ❌ La génération a échoué. Réessaie avec un autre prompt.'
        });
    }
}

export default {
    name: 'sora',
    execute: soraCommand
};