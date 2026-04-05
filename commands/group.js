 // commands/group.js
import axios from 'axios';
import sharp from 'sharp';
import { isJidGroup, getContentType } from 'baileys';
import configManager from '../utils/manageConfigs.js';
import channelSender from '../commands/channelSender.js';
import { OWNER_NUM } from '../config.js';
import { sendWithContext } from '../utils/sendWithContext.js';

// ======================= FONCTIONS D'AIDE =======================
async function isGroupAdmin(client, groupJid, userJid) {
    try {
        const metadata = await client.groupMetadata(groupJid);
        const participant = metadata.participants.find(p => p.id === userJid);
        return !!(participant?.admin);
    } catch {
        return false;
    }
}

async function isAdmin(client, groupJid, userJid) {
    try {
        const metadata = await client.groupMetadata(groupJid);
        const participants = metadata.participants;
        return participants.some(p => p.id === userJid && (p.admin === "admin" || p.admin === "superadmin"));
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des métadonnées du groupe :", error);
        return false;
    }
}

// ======================= ENVOI DE MESSAGE AVEC IMAGE ET CONTEXTE =======================
async function sendImageWithContext(client, jid, text, imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        let imageBuffer = Buffer.from(response.data, 'binary');
        try {
            imageBuffer = await sharp(imageBuffer)
                .resize({ width: 800, withoutEnlargement: true })
                .toBuffer();
        } catch (err) {
            console.error("Erreur redimensionnement image:", err);
        }
        await sendWithContext(client, jid, { image: imageBuffer, caption: text });
    } catch (error) {
        console.error("Erreur envoi image avec contexte:", error);
        await sendWithContext(client, jid, { text });
    }
}

// ======================= ACTIONS DE GROUPE =======================
export async function handleGroupAction(message, client, action) {
    const remoteJid = message.key.remoteJid;
    try {
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const commandAndArgs = messageBody.slice(1).trim();
        const parts = commandAndArgs.split(/\s+/);
        const args = parts.slice(1);
        const user = message.key.participant;
        let participant;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            participant = message.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            if (user.includes("@lid")) {
                participant = args[0].replace('@', '') + '@lid';
            } else {
                participant = args[0].replace('@', '') + '@s.whatsapp.net';
            }
        } else {
            throw new Error('> `Makima m-dx :` Aucun participant spécifié.');
        }

        const num = `@${participant.replace('@s.whatsapp.net', '')}`;
        await client.groupParticipantsUpdate(remoteJid, [participant], action);

        let actionMessages = {
            remove: `${num} a été retiré.`,
            promote: `_${num} a été promu administrateur._`,
            demote: `_${num} a été retiré des administrateurs._`
        };
        let text = `> \`Makima m-dx :\` ${actionMessages[action]}`;
        
        if (action === 'promote') {
            await sendImageWithContext(client, remoteJid, text, 'https://files.catbox.moe/k5pfvp.jpg');
        } else if (action === 'demote') {
            await sendImageWithContext(client, remoteJid, text, 'https://files.catbox.moe/epxzez.jpg');
        } else {
            await sendWithContext(client, remoteJid, { text });
        }
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur : Impossible d'effectuer l'action. ${error.message}_` });
    }
}

export async function kick(message, client) {
    await handleGroupAction(message, client, 'remove');
}

export async function promote(message, client) {
    await handleGroupAction(message, client, 'promote');
}

export async function demote(message, client) {
    await handleGroupAction(message, client, 'demote');
}

export async function kickall(message, client) {
    const remoteJid = message.key.remoteJid;
    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants;
        for (const participant of participants) {
            if (!participant.admin) {
                try {
                    await client.groupParticipantsUpdate(remoteJid, [participant.id], 'remove');
                } catch (err) {
                    console.log(err);
                }
            }
        }
        await sendWithContext(client, remoteJid, { text: '_Nettoyage du groupe terminé._' });
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur : Impossible de traiter le retrait. ${error.message}_` });
    }
}

export async function purge(message, client) {
    const remoteJid = message.key.remoteJid;
    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const nonAdmins = groupMetadata.participants.filter(p => !p.admin).map(p => p.id);
        if (nonAdmins.length === 0) {
            await sendWithContext(client, remoteJid, { text: '> `Makima m-dx :` Aucun membre non-admin à retirer.' });
            return;
        }
        await client.groupParticipantsUpdate(remoteJid, nonAdmins, 'remove');
        
        const purgeMessage = `> Makima m-dx : 🌑 *Purge effectuée.*
> Tous les non‑administrateurs ont été retirés.
> Que le silence remplace le chaos.`;

        // Envoi normal sans contexte (ni sendWithContext ni sendImageWithContext)
        const imageUrl = 'https://files.catbox.moe/35i7on.jpg';
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        let imageBuffer = Buffer.from(response.data, 'binary');
        try {
            imageBuffer = await sharp(imageBuffer)
                .resize({ width: 800, withoutEnlargement: true })
                .toBuffer();
        } catch (err) {
            console.error("Erreur redimensionnement image pour purge:", err);
        }
        await client.sendMessage(remoteJid, { image: imageBuffer, caption: purgeMessage });
    } catch (error) {
        console.log(error);
    }
}

export async function bye(message, client) {
    const remoteJid = message.key.remoteJid;
    try {
        await sendWithContext(client, remoteJid, { text: '_🌑 Je m’éclipse_' });
        await client.groupLeave(remoteJid);
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur : Impossible de quitter le groupe. ${error.message}_` });
    }
}

export async function pall(message, client) {
    const remoteJid = message.key.remoteJid;
    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const nonAdmins = groupMetadata.participants.filter(p => !p.admin).map(p => p.id);
        await client.groupParticipantsUpdate(remoteJid, nonAdmins, 'promote');
        const text = `> Makima m-dx : _Promotion de tous les membres non-admins effectuée._`;
        await sendImageWithContext(client, remoteJid, text, 'https://files.catbox.moe/k5pfvp.jpg');
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur : Impossible de promouvoir les participants. ${error.message}_` });
    }
}

export async function dall(message, client, userLid) {
    const remoteJid = message.key.remoteJid;
    try {
        const { participants } = await client.groupMetadata(remoteJid);
        const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        let botLid = "";
        if (userLid && typeof userLid === 'string') {
            botLid = userLid.split(':')[0] + "@lid";
        } else if (Array.isArray(userLid) && userLid.length > 0 && typeof userLid[0] === 'string') {
            botLid = userLid[0].split(':')[0] + "@lid";
        }
        const admins = participants.filter(p => p.admin && p.id !== botNumber && p.id !== botLid).map(p => p.id);
        if (admins.length > 0) {
            await client.groupParticipantsUpdate(remoteJid, admins, 'demote');
            const text = `> Makima m-dx : _Je prends le contrôle de ce groupe pour l'instant._`;
            await sendImageWithContext(client, remoteJid, text, 'https://files.catbox.moe/epxzez.jpg');
        }
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur : ${error.message}_` });
    }
}

export async function mute(message, client) {
    const remoteJid = message.key.remoteJid;
    try {
        await client.groupSettingUpdate(remoteJid, 'announcement');
        await sendWithContext(client, remoteJid, { text: 'Le groupe a été verrouillé.' });
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur : ${error.message}_` });
    }
}

export async function unmute(message, client) {
    const remoteJid = message.key.remoteJid;
    try {
        await client.groupSettingUpdate(remoteJid, 'not_announcement');
        await sendWithContext(client, remoteJid, { text: 'Le groupe a été déverrouillé.' });
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur : ${error.message}_` });
    }
}

export async function gclink(message, client) {
    const remoteJid = message.key.remoteJid;
    try {
        const code = await client.groupInviteCode(remoteJid);
        await sendWithContext(client, remoteJid, { text: `> Makima m-dx : https://chat.whatsapp.com/${code}` });
    } catch (error) {
        await sendWithContext(client, remoteJid, { text: `_Erreur lors de la génération du lien du groupe : vous n'êtes pas admin. ${error.message}_` });
    }
}

// ======================= AUTRES FONCTIONS =======================
export async function gcid(message, client) {
    const remoteJid = message.key.remoteJid;
    if (remoteJid.endsWith('@g.us')) {
        await sendWithContext(client, remoteJid, { text: `> Makima m-dx : L'ID du groupe est : ${remoteJid}` });
    } else {
        await sendWithContext(client, remoteJid, { text: `> Makima m-dx : Désolé, ce n'est pas un groupe.` });
    }
}

export async function mentiondetect(message, client, lids = []) {
    const remoteJid = message.key.remoteJid;
    const number = client.user.id.split(':')[0];
    const senderJid = message.key.participant || remoteJid;
    const botId = number + "@s.whatsapp.net";
    const botLids = Array.isArray(lids) ? lids : [lids];
    const type = getContentType(message.message);

    if (type === 'groupStatusMentionMessage') {
        console.log("mention détectée");
        const senderIsAdmin = await isAdmin(client, remoteJid, senderJid);
        const mainBotIsAdmin = await isAdmin(client, remoteJid, botId);
        const linkedBotsAreAdmin = await Promise.all(botLids.map(lid => isAdmin(client, remoteJid, lid)));
        const atLeastOneLinkedBotAdmin = linkedBotsAreAdmin.includes(true);
        const botIsAdmin = mainBotIsAdmin || atLeastOneLinkedBotAdmin;
        const senderIsBot = senderJid === botId || botLids.includes(senderJid);

        if (!botIsAdmin || senderIsAdmin || senderIsBot) return;
        await client.sendMessage(remoteJid, { delete: message.key });
    }
}

// ======================= EXPORT =======================
export default {
    kick,
    kickall,
    promote,
    demote,
    bye,
    pall,
    dall,
    mute,
    unmute,
    gclink,
    purge,
    gcid,
    mentiondetect
};