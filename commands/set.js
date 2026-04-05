 // commands/set.js
import configManager from '../utils/manageConfigs.js';
import { sendWithContext } from '../utils/sendWithContext.js';

// Image fixe pour toutes les réponses
const FIXED_IMAGE_URL = 'https://files.catbox.moe/ymtwvw.jpg';

function isEmoji(str) {
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;
    return emojiRegex.test(str);
}

export async function setprefix(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    const prefix = args[0] || '';
    configManager.config.users[number] = configManager.config.users[number] || {};
    configManager.config.users[number].prefix = prefix;
    configManager.save();

    const displayPrefix = prefix === '' ? 'aucun' : `« ${prefix} »`;
    await sendWithContext(client, remoteJid, {
        image: { url: FIXED_IMAGE_URL },
        caption: `> \`Makima m-dx\` : Préfixe changé avec succès en ${displayPrefix}`
    }, { quoted: message });
}

export async function setreaction(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    if (args.length > 0 && isEmoji(args[0])) {
        const reaction = args[0];
        configManager.config.users[number] = configManager.config.users[number] || {};
        configManager.config.users[number].reaction = reaction;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Réaction changée avec succès"
        }, { quoted: message });
    } else {
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Veuillez spécifier un emoji valide."
        }, { quoted: message });
    }
}

export async function setwelcome(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    if (!configManager.config?.users[number]) return;
    const option = args.join(' ').toLowerCase();
    if (option.includes("on")) {
        configManager.config.users[number].welcome = true;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Accueil activé"
        }, { quoted: message });
    } else if (option.includes("off")) {
        configManager.config.users[number].welcome = false;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Accueil désactivé"
        }, { quoted: message });
    } else {
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Choisissez on ou off"
        }, { quoted: message });
    }
}

export async function setautorecord(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    if (!configManager.config?.users[number]) return;
    const option = args.join(' ').toLowerCase();
    if (option.includes("on")) {
        configManager.config.users[number].record = true;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Auto-enregistrement activé"
        }, { quoted: message });
    } else if (option.includes("off")) {
        configManager.config.users[number].record = false;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Auto-enregistrement désactivé"
        }, { quoted: message });
    } else {
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Choisissez on ou off"
        }, { quoted: message });
    }
}

export async function setautotype(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    if (!configManager.config?.users[number]) return;
    const option = args.join(' ').toLowerCase();
    if (option.includes("on")) {
        configManager.config.users[number].type = true;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Auto-typage activé"
        }, { quoted: message });
    } else if (option.includes("off")) {
        configManager.config.users[number].type = false;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Auto-typage désactivé"
        }, { quoted: message });
    } else {
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Choisissez on ou off"
        }, { quoted: message });
    }
}

export async function setonline(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    if (!configManager.config?.users[number]) return;
    const option = args.join(' ').toLowerCase();
    if (option.includes("on")) {
        configManager.config.users[number].online = true;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Statut en ligne activé"
        }, { quoted: message });
    } else if (option.includes("off")) {
        configManager.config.users[number].online = false;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Statut en ligne désactivé"
        }, { quoted: message });
    } else {
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Choisissez on ou off"
        }, { quoted: message });
    }
}

export async function setlike(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    if (!configManager.config?.users[number]) return;
    const option = args.join(' ').toLowerCase();
    if (option.includes("on")) {
        configManager.config.users[number].like = true;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Like sur statut activé"
        }, { quoted: message });
    } else if (option.includes("off")) {
        configManager.config.users[number].like = false;
        configManager.save();
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Like sur statut désactivé"
        }, { quoted: message });
    } else {
        await sendWithContext(client, remoteJid, {
            image: { url: FIXED_IMAGE_URL },
            caption: "> `Makima m-dx` : Choisissez on ou off"
        }, { quoted: message });
    }
}

export default { setprefix, setreaction, setwelcome, setautorecord, setautotype, setonline, setlike };