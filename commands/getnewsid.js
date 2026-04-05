 // commands/getnewsid.js
import { sendWithContext } from '../utils/sendWithContext.js';

export async function getnewsid(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
        const link = args[0];

        if (!link || !link.includes("whatsapp.com/channel/")) {
            return await sendWithContext(sock, from, {
                text: "> Makima m-dx : ❌ Donne un lien de chaîne WhatsApp\n\nExemple : .getnewsid https://whatsapp.com/channel/0029VbBz3AYBPzjd5is5mJ2W"
            });
        }

        // Extraire le code après /channel/
        const code = link.split("/channel/")[1];
        if (!code) {
            return await sendWithContext(sock, from, {
                text: "> Makima m-dx : ❌ Lien invalide, impossible d'extraire le code."
            });
        }

        // Récupérer les métadonnées de la newsletter (Baileys v7)
        const res = await sock.newsletterMetadata("invite", code);
        const id = res.id;        // Ex: "120363407096919821" ou "120363407096919821@newsletter"
        const name = res.name || "Inconnue";

        // S'assurer que l'ID est bien au format numérique@newsletter
        let newsletterJid = id;
        if (!id.includes('@')) {
            newsletterJid = `${id}@newsletter`;
        }

        await sendWithContext(sock, from, {
            text: `> Makima m-dx : 📢 *Chaîne :* ${name}\n> *ID complet :* \`${newsletterJid}\``
        });
    } catch (error) {
        console.error("Erreur getnewsid:", error);
        await sendWithContext(sock, from, {
            text: "> Makima m-dx : ❌ Impossible de récupérer l'ID. Lien invalide, chaîne privée ou erreur réseau."
        });
    }
}

export default {
    name: "getnewsid",
    execute: getnewsid
};