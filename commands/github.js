 // commands/github.js
import axios from 'axios';
import { sendWithContext } from '../utils/sendWithContext.js';

export async function githubCommand(sock, chatId, message, args) {
    const repoUrl = args[0];
    if (!repoUrl) {
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : 📦 *Usage :* .github <url_du_dépôt>\nExemple : .github https://github.com/Danscot/senku-xmd'
        });
        return;
    }

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : ❌ URL GitHub invalide.'
        });
        return;
    }
    const owner = match[1];
    const repo = match[2];

    try {
        // 1. Infos du dépôt via API GitHub
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const repoRes = await axios.get(apiUrl);
        const repoData = repoRes.data;

        // 2. Télécharger le ZIP
        const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;
        const zipRes = await axios.get(zipUrl, { responseType: 'arraybuffer' });
        const zipBuffer = Buffer.from(zipRes.data);
        const zipSizeMB = (zipBuffer.length / (1024 * 1024)).toFixed(2);
        const repoSizeMB = (repoData.size / 1024).toFixed(2);

        // 3. Construire la légende complète
        const caption = `> \`𝗠𝗔𝗞𝗜𝗠𝗔 𝗠-𝗗𝗫 :\` 📦 *DÉPÔT TÉLÉCHARGÉ by THE DARKNESS*\n\n` +
            `◉ *Nom :* ${repoData.name}\n` +
            `◉ *Propriétaire :* ${repoData.owner.login}\n` +
            `◉ *Description :* ${repoData.description || 'Aucune'}\n` +
            `◉ *⭐ Étoiles :* ${repoData.stargazers_count}\n` +
            `◉ *🔱 Forks :* ${repoData.forks_count}\n` +
            `◉ *👀 Watchers :* ${repoData.watchers_count}\n` +
            `◉ *📦 Taille source :* ${repoSizeMB} MB\n` +
            `◉ *🗜️ Taille ZIP :* ${zipSizeMB} MB\n` +
            `◉ *🕒 Dernière mise à jour :* ${new Date(repoData.updated_at).toLocaleString()}\n` +
            `◉ *🔗 Lien :* ${repoData.html_url}\n\n` +
            `> Fichier joint : archive du dépôt.`;

        // 4. Envoyer le ZIP comme document avec la légende
        const fileName = `${repoData.name}_${repoData.default_branch || 'main'}.zip`;
        await sock.sendMessage(chatId, {
            document: zipBuffer,
            mimetype: 'application/zip',
            fileName: fileName,
            caption: caption
        });

        // (Suppression de l'envoi de l'image de confirmation)

    } catch (error) {
        console.error('Erreur github:', error);
        await sendWithContext(sock, chatId, {
            text: '> Makima m-dx : ❌ Impossible de récupérer ou télécharger le dépôt. Vérifie l’URL et les droits d’accès.'
        });
    }
}

export default {
    name: 'github',
    execute: githubCommand
};