 // commands/reactions.js
import configManager from '../utils/manageConfigs.js';
import channelSender from '../commands/channelSender.js';

export async function auto(message, client, cond, emoji = "🌹") {
    if (cond) {
        await client.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    }
}

export async function autoreact(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);
    if (args.length === 0) {
        await client.sendMessage(remoteJid, { text: "> `Makima m-dx :` Veuillez fournir 'on' ou 'off'." });
        return;
    }
    const input = args[0].toLowerCase();
    const userConfig = configManager.config.users[number] || {};
    if (input === 'on') {
        userConfig.autoreact = true;
        configManager.save();
        await channelSender(message, client, `Auto-réaction activée`, 3);
    } else if (input === "off") {
        userConfig.autoreact = false;
        configManager.save();
        await channelSender(message, client, `Auto-réaction désactivée`, 3);
    } else {
        await client.sendMessage(remoteJid, { text: "_*Choisissez : on/off*_" });
    }
}

export default { auto, autoreact };