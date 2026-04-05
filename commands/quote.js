// commands/quote.js
import axios from 'axios';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function quoteCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await axios.get(`https://shizoapi.onrender.com/api/texts/quotes?apikey=${shizokeys}`);
        const quote = res.data?.result || '“L’ombre ne juge pas, elle observe.”';
        await sendWithContext(sock, chatId, {
            text: `> Makima m-dx : 🌑 *Citation du jour*\n\n_${quote}_`
        });
    } catch (error) {
        console.error('Erreur quote:', error);
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : ❌ Impossible de récupérer une citation.'
        });
    }
}

export default {
    name: 'quote',
    execute: quoteCommand
};