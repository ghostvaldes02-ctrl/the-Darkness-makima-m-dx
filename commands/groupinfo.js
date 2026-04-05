// commands/groupinfo.js
import { sendWithContext } from '../utils/sendWithContext.js';

export async function groupInfoCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sendWithContext(sock, chatId, {
                text: '> Makima m-dx : ❌ Cette commande n’est utilisable que dans un groupe.'
            });
            return;
        }

        // Métadonnées du groupe
        const groupMetadata = await sock.groupMetadata(chatId);

        // Récupération de la photo de profil (ou image par défaut)
        let ppUrl;
        try {
            ppUrl = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            ppUrl = 'https://files.catbox.moe/g7tyh7.jpg';
        }

        // Récupération du lien d'invitation (sans vérification admin)
        let inviteLink = 'Non disponible';
        try {
            const code = await sock.groupInviteCode(chatId);
            inviteLink = `https://chat.whatsapp.com/${code}`;
        } catch {
            // Ignorer l'erreur, le lien reste "Non disponible"
        }

        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i+1}. @${v.id.split('@')[0]}`).join('\n');
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        const text = `> Makima m-dx : 📋 *INFORMATIONS DU GROUPE*\n\n` +
            `▪️ *ID :* \`${groupMetadata.id}\`\n` +
            `▪️ *Nom :* ${groupMetadata.subject}\n` +
            `▪️ *Membres :* ${participants.length}\n` +
            `▪️ *Propriétaire :* @${owner.split('@')[0]}\n` +
            `▪️ *Lien d’invitation :* ${inviteLink}\n` +
            `▪️ *Admins :*\n${listAdmin}\n` +
            `▪️ *Description :* ${groupMetadata.desc?.toString() || 'Aucune'}`;

        await sendWithContext(sock, chatId, {
            image: { url: ppUrl },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        });
    } catch (error) {
        console.error('Erreur groupinfo:', error);
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : ❌ Impossible de récupérer les infos du groupe.'
        });
    }
}

export default {
    name: 'groupinfo',
    execute: groupInfoCommand
};