// commands/getpp.js
import { sendWithContext } from '../utils/sendWithContext.js';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    let targetJid;

    const quoted = message.message?.extendedTextMessage?.contextInfo;
    const mentions = quoted?.mentionedJid;
    if (mentions && mentions.length) {
        targetJid = mentions[0];
    } else if (quoted?.participant) {
        targetJid = quoted.participant;
    } else if (args && args[0]) {
        let num = args[0].replace(/[^0-9]/g, '');
        if (num.length < 7) {
            return sendWithContext(client, remoteJid, {
                text: '> `Makima m-dx :` ❌ Numéro invalide.'
            });
        }
        targetJid = num + '@s.whatsapp.net';
    }

    if (!targetJid) {
        targetJid = message.key.fromMe ? client.user.id : (message.key.participant || remoteJid);
    }

    try {
        const url = await client.profilePictureUrl(targetJid, "image");
        await sendWithContext(client, remoteJid, {
            image: { url },
            caption: `> \`Makima m-dx :\` 📸 Photo de profil de @${targetJid.split("@")[0]}`,
            mentions: [targetJid]
        });
    } catch (err) {
        console.error('Erreur getpp:', err);
        await sendWithContext(client, remoteJid, {
            text: `> \`Makima m-dx :\` ❌ Impossible de récupérer la photo de @${targetJid.split("@")[0]}.`
        });
    }
}

export default { execute };