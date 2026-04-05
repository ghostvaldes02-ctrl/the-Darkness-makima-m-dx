 // utils/sendWithContext.js
import fs from 'fs';
import path from 'path';
import { WA_CHANNEL } from '../config.js';

const NEWSLETTER_JID = "120363407767772281@newsletter";
const NEWSLETTER_NAME = "𝗠𝗔𝗞𝗜𝗠𝗔 𓅂𝗠-𝗗𝗫";

let thumbBuffer = null;

// Charger l'image distante au démarrage
const thumbnailUrl = 'https://files.catbox.moe/6l3b4o.jpg';
(async () => {
    try {
        const response = await fetch(thumbnailUrl);
        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            thumbBuffer = Buffer.from(arrayBuffer);
            console.log('✅ Thumbnail chargé avec succès');
        } else {
            console.error(`❌ Échec chargement thumbnail : ${response.status}`);
            // Fallback vers fichier local
            const fallbackPaths = [path.resolve('3.png'), path.resolve('3.jpg')];
            for (const p of fallbackPaths) {
                if (fs.existsSync(p)) {
                    thumbBuffer = fs.readFileSync(p);
                    console.log(`✅ Thumbnail fallback chargé depuis ${p}`);
                    break;
                }
            }
        }
    } catch (err) {
        console.error('❌ Erreur chargement thumbnail :', err.message);
        // Fallback vers fichier local
        const fallbackPaths = [path.resolve('3.png'), path.resolve('3.jpg')];
        for (const p of fallbackPaths) {
            if (fs.existsSync(p)) {
                thumbBuffer = fs.readFileSync(p);
                console.log(`✅ Thumbnail fallback chargé depuis ${p}`);
                break;
            }
        }
    }
})();

export function getContextInfo() {
    return {
        forwardingScore: 99,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWSLETTER_JID,
            newsletterName: NEWSLETTER_NAME,
            serverMessageId: -1
        },
        externalAdReply: {
            title: "Rejoins notre chaîne WhatsApp",
            body: "𝗠𝗔𝗞𝗜𝗠𝗔 𓅂𝗠-𝗗𝗫",
            mediaType: 1,
            thumbnail: thumbBuffer,
            renderLargerThumbnail: false,
            mediaUrl: WA_CHANNEL,
            sourceUrl: WA_CHANNEL,
            thumbnailUrl: WA_CHANNEL
        }
    };
}

export async function sendWithContext(client, remoteJid, content, options = {}) {
    const contextInfo = getContextInfo();
    const message = {
        ...content,
        contextInfo
    };
    return await client.sendMessage(remoteJid, message, options);
}