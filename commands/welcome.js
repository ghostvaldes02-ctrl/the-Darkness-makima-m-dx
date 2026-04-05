 // commands/welcome.js
import path from 'path';
import fs from 'fs';
import configManager from '../utils/manageConfigs.js';
import { OWNER_NUM } from '../config.js';
import { sendWithContext } from '../utils/sendWithContext.js';

function getBotNumber(client) {
    return client.user.id.split(':')[0];
}

function isWelcomeEnabled(client) {
    const number = getBotNumber(client);
    return configManager.config?.users[number]?.welcome || false;
}

function setWelcomeEnabled(client, enabled) {
    const number = getBotNumber(client);
    if (!configManager.config.users[number]) configManager.config.users[number] = {};
    configManager.config.users[number].welcome = enabled;
    configManager.save();
}

function extractJid(participant) {
    if (typeof participant === 'string') return participant;
    if (participant && typeof participant === 'object') {
        return participant.participant || participant.participantAlt || participant.id || Object.values(participant)[0];
    }
    return null;
}

export async function welcome(update, client) {
    const number = getBotNumber(client);
    const state = configManager.config?.users[number]?.welcome;
    if (!state) return;

    const metadata = await client.groupMetadata(update.id);

    for (const participant of update.participants) {
        const jid = extractJid(participant);
        if (!jid) continue;

        try {
            let pp;
            try {
                pp = await client.profilePictureUrl(jid, 'image');
            } catch {
                // Image par défaut
                pp = 'https://files.catbox.moe/l6r72v.jpg';
            }

            const tag = `@${jid.split('@')[0]}`;
            const groupName = metadata.subject;

            if (update.action === 'add') {
                const welcomeMsg = `
> \`𝙼𝙰𝙺𝙸𝙼𝙰 𝙼-𝙳𝚇 • 𝚆𝙴𝙻𝙲𝙾𝙼𝙴\` 
✧ ✧┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄✧
> 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝚄𝙴 𝙰 𝚃𝙾𝙸 🌹 
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄✧
┊ 👤 ${tag} 𝙽𝙾𝚄𝚂 𝙰 𝚁𝙴𝙹𝙾𝙸𝙽𝚃
┊ 𝙳𝙰𝙽𝚂  *${groupName}*!
╰┄┄┄┄┄●
╭┄┄┄┄┄●
┊ \`𝙽𝙱\` : 𝚂𝙴𝙽𝚃 𝚃𝙾𝙸 𝚃𝚁𝙰𝙽𝚀𝚄𝙸𝙻𝙻𝙴
┊📚 𝙹𝚄𝚂𝚃𝙴 𝚁𝙴𝚂𝙿𝙴𝙲𝚃 𝙻𝙴𝚂 𝙰𝙳𝙼𝙸𝙽𝚂
╰✦ ✦┄┄┄┄┄┄┄┄┄┄┄┄┄┄✧
> 𝙿𝚁𝙾𝙿𝚄𝙻𝚂𝙴́ 𝙿𝙰𝚁 𝚃𝙷𝙴 𝙳𝙰𝚁𝙺𝙽𝙴𝚂𝚂
                `.trim();
                await sendWithContext(client, update.id, {
                    image: { url: pp },
                    caption: welcomeMsg,
                    mentions: [jid]
                });
            } else if (update.action === 'remove') {
                const byeMsg = `
> \`𝙼𝙰𝙺𝙸𝙼𝙰 𝙼-𝙳𝚇 • 𝚆𝙴𝙻𝙲𝙾𝙼𝙴\` 
✧ ✧┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄✧
> 𝙵𝙸𝙲𝙷𝙴 𝙽𝙾𝚄𝚂 𝙻𝙴 𝙲𝙰𝙼𝙿𝚂 🌹 
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄✧
┊ 👤 ${tag} 𝙽𝙾𝚄𝚂 𝙰 𝚀𝚄𝙸𝚃𝚃𝙴́
┊ 𝙳𝙰𝙽𝚂  *${groupName}*!
╰┄┄┄┄┄●
╭┄┄┄┄┄●
┊ \`𝙽𝙱\` : 𝚃𝚄 𝙽'𝙴𝚃𝙰𝙸𝚂 𝙿𝙰𝚂 𝚄𝚃𝙸𝙻 
┊💬 𝙱𝙾𝙽 𝙳𝙴́𝙱𝙰𝚁𝚁𝙰𝚂
╰✦ ✦┄┄┄┄┄┄┄┄┄┄┄┄┄┄✧
> 𝙿𝚁𝙾𝙿𝚄𝙻𝚂𝙴́ 𝙿𝙰𝚁 𝚃𝙷𝙴 𝙳𝙰𝚁𝙺𝙽𝙴𝚂𝚂
                `.trim();
                await sendWithContext(client, update.id, {
                    image: { url: pp },
                    caption: byeMsg,
                    mentions: [jid]
                });
            }
        } catch (err) {
            console.error("❌ Error in welcome/goodbye:", err);
        }
    }
}

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    const isGroup = remoteJid.endsWith('@g.us');
    if (!isGroup) {
        return sendWithContext(client, remoteJid, {
            image: { url: 'https://files.catbox.moe/l6r72v.jpg' },
            caption: '> `Makima m-dx :` ⛔ Cette commande ne peut être utilisée que dans un groupe.'
        });
    }

    const number = getBotNumber(client);
    const prefix = configManager.config?.users[number]?.prefix || '.';

    const senderJid = message.key.fromMe ? client.user.id : (message.key.participant || remoteJid);
    const senderNumber = senderJid.split('@')[0].split(':')[0];
    const botNumber = getBotNumber(client);
    const isOwner = (senderNumber === OWNER_NUM) || (senderNumber === botNumber);

    if (!isOwner) {
        return sendWithContext(client, remoteJid, {
            image: { url: 'https://files.catbox.moe/l6r72v.jpg' },
            caption: '> `Makima m-dx :` ❌ Seul le propriétaire peut modifier ce paramètre.'
        });
    }

    if (!args || args.length === 0) {
        const etat = isWelcomeEnabled(client) ? 'activé' : 'désactivé';
        const text = `> \`Makima m-dx :\` 🔔 Le message de bienvenue/au revoir est actuellement *${etat}*. Utilisez \`${prefix}welcome on\` ou \`${prefix}welcome off\` pour changer.`;
        return sendWithContext(client, remoteJid, {
            image: { url: 'https://files.catbox.moe/l6r72v.jpg' },
            caption: text
        });
    }

    const option = args[0].toLowerCase();
    if (option === 'on') {
        setWelcomeEnabled(client, true);
        await sendWithContext(client, remoteJid, {
            image: { url: 'https://files.catbox.moe/l6r72v.jpg' },
            caption: '> `Makima m-dx :` ✅ Messages de bienvenue/au revoir activés.'
        });
    } else if (option === 'off') {
        setWelcomeEnabled(client, false);
        await sendWithContext(client, remoteJid, {
            image: { url: 'https://files.catbox.moe/l6r72v.jpg' },
            caption: '> `Makima m-dx :` ❌ Messages de bienvenue/au revoir désactivés.'
        });
    } else {
        await sendWithContext(client, remoteJid, {
            image: { url: 'https://files.catbox.moe/l6r72v.jpg' },
            caption: '> `Makima m-dx :` ❌ Option invalide. Utilise `on` ou `off`.'
        });
    }
}

export default { welcome, execute };