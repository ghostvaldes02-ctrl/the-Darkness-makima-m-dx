// commands/add.js
import { sendWithContext } from '../utils/sendWithContext.js';

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Cette commande ne peut être utilisée que dans un groupe.'
        });
    }

    if (!args || args.length === 0) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Veuillez fournir un numéro. Exemple : .add 237655374632'
        });
    }

    let targetNumber = args[0].replace(/[^0-9]/g, '');
    if (!targetNumber || targetNumber.length < 7) {
        return sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Numéro invalide.'
        });
    }

    const targetJid = targetNumber + '@s.whatsapp.net';

    try {
        await client.groupParticipantsUpdate(remoteJid, [targetJid], 'add');
        await sendWithContext(client, remoteJid, {
            text: `> \`Makima m-dx :\` ✅ Numéro ${targetNumber} ajouté avec succès.`
        });
    } catch (err) {
        console.error('Erreur add:', err);
        await sendWithContext(client, remoteJid, {
            text: `> \`Makima m-dx :\` ❌ Échec de l’ajout. Vérifiez que le bot est admin et que le numéro est valide.`
        });
    }
}

export default { execute };