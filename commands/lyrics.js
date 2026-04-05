// commands/lyrics.js
import axios from 'axios';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function lyricsCommand(sock, chatId, message, args) {
    const songTitle = args.join(' ');
    if (!songTitle) {
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : 🎵 *Usage :* .lyrics <titre de la chanson>'
        });
        return;
    }

    try {
        const apiUrl = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(songTitle)}`;
        const res = await axios.get(apiUrl);
        const lyrics = res.data?.result?.lyrics;
        if (!lyrics) {
            await sendWithContext(sock, chatId, {
                text: `> Makima m-dx : ❌ Aucune parole trouvée pour "${songTitle}".`
            });
            return;
        }

        const maxChars = 4000;
        const output = lyrics.length > maxChars ? lyrics.slice(0, maxChars - 3) + '...' : lyrics;
        await sendWithContext(sock, chatId, { text: `> Makima m-dx : 🎶 *Paroles de ${songTitle}*\n\n${output}` });
    } catch (error) {
        console.error('Erreur lyrics:', error);
        await sendWithContext(sock, chatId, {
            text: `> Makima m-dx : ❌ Erreur lors de la recherche des paroles.`
        });
    }
}

export default {
    name: 'lyrics',
    execute: lyricsCommand
};