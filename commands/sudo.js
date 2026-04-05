 // commands/sudo.js
import configManager from '../utils/manageConfigs.js';
import { OWNER_NUM } from '../config.js';
import { sendWithContext } from '../utils/sendWithContext.js';

const normalizeJid = (jid) => jid?.split(':')[0] + '@s.whatsapp.net';

async function isAuthorized(message, client) {
    const senderJid = message.key.participant || message.key.remoteJid;
    const ownerJid = OWNER_NUM + '@s.whatsapp.net';
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';

    return normalizeJid(senderJid) === normalizeJid(ownerJid) ||
           normalizeJid(senderJid) === normalizeJid(botJid) ||
           message.key.fromMe;
}

export async function modifySudoList(message, client, list, action, args) {
    try {
        if (!await isAuthorized(message, client)) {
            return sendWithContext(client, message.key.remoteJid, {
                text: '> `Makima m-dx :` ❌ Seul le propriétaire peut gérer la liste sudo.'
            });
        }

        const remoteJid = message.key.remoteJid;

        if (action === 'remove' && args[0]?.toLowerCase() === 'all') {
            list.length = 0;
            return sendWithContext(client, remoteJid, {
                text: '> `Makima m-dx :` ✅ Tous les utilisateurs sudo ont été retirés.'
            });
        }

        let participant;
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedParticipant = message.message.extendedTextMessage.contextInfo.participant;
            participant = quotedParticipant?.split('@')[0]?.split(':')[0];
            if (!participant) throw new Error('Participant invalide.');
        } else if (args.length > 0) {
            const match = args[0].match(/\d+/);
            if (!match) throw new Error('Format invalide.');
            participant = match[0];
        } else {
            throw new Error('Aucune cible spécifiée.');
        }

        if (action === 'add') {
            if (!list.includes(participant)) {
                list.push(participant);
                await sendWithContext(client, remoteJid, {
                    text: `> \`Makima m-dx :\` ✅ _${participant} est désormais sudo._`
                });
            } else {
                await sendWithContext(client, remoteJid, {
                    text: `> \`Makima m-dx :\` ⚠️ _${participant} est déjà sudo._`
                });
            }
        } else if (action === 'remove') {
            const index = list.indexOf(participant);
            if (index !== -1) {
                list.splice(index, 1);
                await sendWithContext(client, remoteJid, {
                    text: `> \`Makima m-dx :\` 🗑️ _${participant} n’est plus sudo._`
                });
            } else {
                await sendWithContext(client, remoteJid, {
                    text: `> \`Makima m-dx :\` ⚠️ _${participant} n’était pas sudo._`
                });
            }
        }
    } catch (error) {
        console.error('Erreur modifySudoList:', error);
        await sendWithContext(client, message.key.remoteJid, {
            text: `> \`Makima m-dx :\` ❌ Erreur : ${error.message}`
        });
    }
}

export async function sudo(message, client, list, args) {
    await modifySudoList(message, client, list, 'add', args);
}

export async function delsudo(message, client, list, args) {
    await modifySudoList(message, client, list, 'remove', args);
}

export async function getsudo(message, client, list) {
    if (!await isAuthorized(message, client)) {
        return sendWithContext(client, message.key.remoteJid, {
            text: '> `Makima m-dx :` ❌ Seul le propriétaire peut consulter la liste sudo.'
        });
    }

    const remoteJid = message.key.remoteJid;
    if (!list.length) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` 📋 *Aucun utilisateur sudo.*'
        });
    }

    let msg = '> `Makima m-dx :` 📋 *Liste des utilisateurs sudo :*\n\n';
    for (let i = 0; i < list.length; i++) {
        msg += `${i + 1}. ${list[i]}\n`;
    }
    await sendWithContext(client, remoteJid, { text: msg });
}

export default { sudo, delsudo, getsudo };