// commands/resetlink.js
import { sendWithContext } from '../utils/sendWithContext.js';

async function isGroupAdmin(client, groupJid, userJid) {
    try {
        const metadata = await client.groupMetadata(groupJid);
        return metadata.participants.some(p => p.id === userJid && p.admin);
    } catch {
        return false;
    }
}

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Cette commande ne peut être utilisée que dans un groupe.'
        });
    }

    const senderJid = message.key.participant || remoteJid;
    const isAdmin = await isGroupAdmin(client, remoteJid, senderJid);
    if (!isAdmin) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Vous devez être administrateur pour utiliser cette commande.'
        });
    }

    try {
        await client.groupRevokeInvite(remoteJid);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ✅ Lien du groupe réinitialisé avec succès.'
        });
    } catch (err) {
        console.error('Erreur resetlink:', err);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Impossible de réinitialiser le lien (vérifiez que le bot est admin).'
        });
    }
}

export default { execute };