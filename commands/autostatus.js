 // commands/autostatus.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendWithContext } from '../utils/sendWithContext.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../data/autoStatus.json');

if (!fs.existsSync(configPath)) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false, reactOn: false }));
}

export function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch {
        return false;
    }
}

export function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch {
        return false;
    }
}

export async function reactToStatus(client, statusKey) {
    try {
        if (!isStatusReactionEnabled()) return;
        await client.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
    } catch (error) {
        console.error('❌ Erreur réaction statut :', error.message);
    }
}

export async function handleStatusUpdate(client, status) {
    try {
        if (!isAutoStatusEnabled()) return;
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await client.readMessages([msg.key]);
                    await reactToStatus(client, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Limite de débit atteinte, attente...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await client.readMessages([msg.key]);
                    } else throw err;
                }
                return;
            }
        }
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await client.readMessages([status.key]);
                await reactToStatus(client, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Limite de débit atteinte, attente...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await client.readMessages([status.key]);
                } else throw err;
            }
            return;
        }
        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await client.readMessages([status.reaction.key]);
                await reactToStatus(client, status.reaction.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Limite de débit atteinte, attente...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await client.readMessages([status.reaction.key]);
                } else throw err;
            }
            return;
        }
    } catch (error) {
        console.error('❌ Erreur auto status :', error.message);
    }
}

export async function execute(message, client, args, ownerJid, sudoList) {
    const remoteJid = message.key.remoteJid;
    const senderJid = message.key.participant || remoteJid;
    const senderNumber = senderJid.split('@')[0];
    const isOwner = senderJid === ownerJid || message.key.fromMe;
    const isSudo = sudoList.includes(senderNumber);
    if (!isOwner && !isSudo) {
        return sendWithContext(client, remoteJid, {
            text: "> `Makima m-dx :` ❌ Seul le propriétaire peut utiliser cette commande."
        }, { quoted: message });
    }
    let config = JSON.parse(fs.readFileSync(configPath));
    if (args.length === 0) {
        const status = config.enabled ? 'activé' : 'désactivé';
        const reactStatus = config.reactOn ? 'activé' : 'désactivé';
        return sendWithContext(client, remoteJid, {
            text: `> \`Makima m-dx :\` 🔄 *Paramètres Auto Status*\n\n📱 *Visionnage auto :* ${status}\n💫 *Réactions aux statuts :* ${reactStatus}\n\n*Commandes :*\n.autostatus on - Activer le visionnage\n.autostatus off - Désactiver le visionnage\n.autostatus react on - Activer les réactions\n.autostatus react off - Désactiver les réactions`
        }, { quoted: message });
    }
    const cmd = args[0].toLowerCase();
    if (cmd === 'on') {
        config.enabled = true;
        fs.writeFileSync(configPath, JSON.stringify(config));
        return sendWithContext(client, remoteJid, {
            text: "> `Makima m-dx :` ✅ Visionnage automatique des statuts activé."
        }, { quoted: message });
    }
    if (cmd === 'off') {
        config.enabled = false;
        fs.writeFileSync(configPath, JSON.stringify(config));
        return sendWithContext(client, remoteJid, {
            text: "> `Makima m-dx :` ❌ Visionnage automatique des statuts désactivé."
        }, { quoted: message });
    }
    if (cmd === 'react') {
        if (!args[1]) {
            return sendWithContext(client, remoteJid, {
                text: "> `Makima m-dx :` ❌ Utilisation : .autostatus react on/off"
            }, { quoted: message });
        }
        const reactCmd = args[1].toLowerCase();
        if (reactCmd === 'on') {
            config.reactOn = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            return sendWithContext(client, remoteJid, {
                text: "> `Makima m-dx :` ✅ Réactions aux statuts activées."
            }, { quoted: message });
        } else if (reactCmd === 'off') {
            config.reactOn = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            return sendWithContext(client, remoteJid, {
                text: "> `Makima m-dx :` ❌ Réactions aux statuts désactivées."
            }, { quoted: message });
        } else {
            return sendWithContext(client, remoteJid, {
                text: "> `Makima m-dx :` ❌ Utilisation : .autostatus react on/off"
            }, { quoted: message });
        }
    }
    return sendWithContext(client, remoteJid, {
        text: "> `Makima m-dx :` ❌ Commande inconnue. Utilise .autostatus sans argument pour voir l'aide."
    }, { quoted: message });
}

export default { isAutoStatusEnabled, isStatusReactionEnabled, handleStatusUpdate, execute };