 // commands/channelSender.js
import { WA_CHANNEL } from '../config.js';

// Image fixe à utiliser pour tous les envois
const FIXED_IMAGE_URL = 'https://files.catbox.moe/6l3b4o.jpg';

export async function channelSender(message, client, texts, num, mentions = []) {
    const remoteJid = message.key.remoteJid;

    // Informations de forward (simule un partage depuis une newsletter)
    const forwardedInfo = {
        forwardingScore: 99,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363407767772281@newsletter',
            newsletterName: "𝗠𝗔𝗞𝗜𝗠𝗔 𓅂𝗠-𝗗𝗫",
            serverMessageId: -1
        }
    };

    // Construction du message avec l'image fixe
    await client.sendMessage(remoteJid, {
        image: { url: FIXED_IMAGE_URL },
        caption: `> ${texts}`,
        mentions,
        contextInfo: {
            forwardingScore: forwardedInfo.forwardingScore,
            isForwarded: forwardedInfo.isForwarded,
            forwardedNewsletterMessageInfo: forwardedInfo.forwardedNewsletterMessageInfo,
            externalAdReply: {
                title: "Rejoins notre chaîne WhatsApp",
                body: "𝘿𝙀𝙑 𝘿𝘼𝙍𝙆𝙉𝙀𝙎𝙎 𝙏𝙀𝘾𝙃",
                mediaType: 1,
                thumbnail: null, // pas de thumbnail local
                renderLargerThumbnail: false,
                mediaUrl: WA_CHANNEL,
                sourceUrl: WA_CHANNEL,
                thumbnailUrl: WA_CHANNEL
            }
        }
    });
}

export default channelSender;