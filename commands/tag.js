 // commands/tag.js
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import configManager from '../utils/manageConfigs.js';
import { OWNER_NAME } from '../config.js';
import { downloadMediaMessage } from 'baileys';
import { sendWithContext } from '../utils/sendWithContext.js';

// URLs des images pour tagall et tagadmin
const TAGALL_IMAGE = 'https://files.catbox.moe/k0d9yp.jpg';
const TAGADMIN_IMAGE = 'https://files.catbox.moe/4yqpqc.jpg';
// URL audio par défaut pour la réponse aux tags
const DEFAULT_TAG_AUDIO = 'https://files.catbox.moe/f6r365.mp3';

// ======================= TAGALL =======================
export async function tagall(message, client) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.includes('@g.us')) {
        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _⚠️ Cette commande ne fonctionne que dans les groupes._' });
        return;
    }

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants.map(u => u.id);
        const mentionsText = participants.map(u => `┊🌹 @${u.split('@')[0]}`).join('\n');

        const tagMessage = `
┏┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┓
┊ 📢 *𝙼𝙰𝙺𝙸𝙼𝙰'𝚂 𝚃𝙰𝙶𝙰𝙻𝙻*
┗┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┛

> 🎯 *𝙶𝚁𝙾𝚄𝙿𝙴:* ${groupMetadata.subject}

${mentionsText}

💬 𝚃𝙰𝙶𝚄𝙴𝚁 𝙿𝙰𝚁 @${message.key.participant?.split('@')[0] || 'Quelqu\'un'}

> 𝙿𝚁𝙾𝙿𝚄𝙻𝚂𝙴́ 𝙿𝙰𝚁 𝙳𝙰𝚁𝙺𝙽𝙴𝚂𝚂
        `.trim();

        await sendWithContext(client, remoteJid, {
            image: { url: TAGALL_IMAGE },
            caption: tagMessage,
            mentions: participants
        });
    } catch (error) {
        console.error("❌ _Erreur lors du tag de tous :_", error);
        await client.sendMessage(remoteJid, { text: "❌ Impossible de taguer tout le monde." });
    }
}

// ======================= TAGADMIN =======================
export async function tagadmin(message, client) {
    const remoteJid = message.key.remoteJid;
    const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';

    if (!remoteJid.includes('@g.us')) {
        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _Cette commande ne fonctionne que dans les groupes._' });
        return;
    }

    try {
        const { participants } = await client.groupMetadata(remoteJid);
        const admins = participants.filter(p => p.admin && p.id !== botNumber).map(p => p.id);

        if (!admins.length) {
            await client.sendMessage(remoteJid, { text: "❌ Aucun admin trouvé dans ce groupe." });
            return;
        }

        const text = `
┏┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┓     
┊ *🌹𝙼𝙰𝙺𝙸𝙼𝙰 𝚃𝙰𝙶𝙰𝙳𝙼𝙸𝙽*
┗┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┛
  \n${admins.map(u => `@${u.split('@')[0]}`).join('\n')}
        `;

        await sendWithContext(client, remoteJid, {
            image: { url: TAGADMIN_IMAGE },
            caption: text,
            mentions: admins
        });
    } catch (error) {
        console.error("❌ Erreur lors du tag des admins :", error);
        await client.sendMessage(remoteJid, { text: "❌ Erreur lors du tag des admins !" });
    }
}

// ======================= TAG (commandes de base) =======================
export async function tag(message, client) {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid.includes('@g.us')) {
        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _Cette commande ne fonctionne que dans les groupes._' });
        return;
    }

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants.map(u => u.id);
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (quotedMessage) {
            const quotedText = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || "";
            const sticker = quotedMessage.stickerMessage;
            if (sticker) {
                await client.sendMessage(remoteJid, { sticker, mentions: participants });
            } else {
                await client.sendMessage(remoteJid, { text: quotedText, mentions: participants });
            }
            return;
        }

        const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const text = messageBody.slice(1).trim().split(/\s+/).slice(1).join(' ') || '> `𝙸 𝙰𝙼 𝙴𝚅𝙸𝙻?`';
        await client.sendMessage(remoteJid, { text, mentions: participants });
    } catch (error) {
        console.error("_Erreur lors du tag :_", error);
    }
}

// ======================= SETTAG (changer audio de réponse) =======================
export async function settag(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage || !quotedMessage.audioMessage) {
            await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` ❌ Répond à un audio' });
            return;
        }

        const audio = await downloadMediaMessage({ message: quotedMessage }, "stream");
        const filePath = `${number}.mp3`;
        const writeStream = fs.createWriteStream(filePath);
        audio.pipe(writeStream);

        // Attendre la fin de l'écriture
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        configManager.config.users[number] = configManager.config.users[number] || {};
        configManager.config.users[number].tagAudioPath = filePath;
        configManager.save();

        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _Audio de tag mis à jour avec succès_' });
    } catch (error) {
        console.error("_Erreur changement audio tag :_", error);
        await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` ❌ Erreur lors de la mise à jour de l\'audio.' });
    }
}

// ======================= RESPOND (réponse automatique quand on mentionne le bot) =======================
export async function respond(message, client, lid) {
    const number = client.user.id.split(":")[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || "";

    if (!configManager.config?.users[number]) return;
    const tagRespond = configManager.config.users[number]?.response;
    if (!message.key.fromMe && tagRespond && (messageBody.includes(`@${number}`) || messageBody.includes("@" + lid[0]?.split("@")[0]))) {
        console.log("Déclenchement réponse audio pour tag");
        let audioSource = configManager.config.users[number]?.tagAudioPath || DEFAULT_TAG_AUDIO;

        // Si l'audio source est une URL (commence par http), on l'envoie directement
        if (audioSource.startsWith('http')) {
            await client.sendMessage(remoteJid, {
                audio: { url: audioSource },
                mimetype: "audio/mpeg",
                ptt: false,
                contextInfo: { stanzaId: message.key.id, participant: message.key.participant || remoteJid, quotedMessage: message.message },
            }).catch(err => console.error("Erreur envoi audio URL :", err));
            return;
        }

        // Sinon, c'est un fichier local, on le convertit
        const inputAudio = audioSource;
        const outputAudio = path.join("temp", `tag_${Date.now()}.ogg`);
        if (!fs.existsSync("temp")) fs.mkdirSync("temp");

        const convertToPTT = (input, output) => {
            return new Promise((resolve, reject) => {
                ffmpeg(input)
                    .audioCodec("libopus")
                    .format("ogg")
                    .audioBitrate("48k")
                    .audioChannels(1)
                    .save(output)
                    .on("end", () => resolve(output))
                    .on("error", reject);
            });
        };

        try {
            const convertedPath = await convertToPTT(inputAudio, outputAudio);
            await client.sendMessage(remoteJid, {
                audio: { url: convertedPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: false,
                contextInfo: { stanzaId: message.key.id, participant: message.key.participant || remoteJid, quotedMessage: message.message },
            });
            fs.unlinkSync(convertedPath);
        } catch (err) {
            console.error("Erreur conversion/envoi audio de tag :", err);
        }
    }
}

// ======================= TAGOPTION (activer/désactiver la réponse audio) =======================
export async function tagoption(message, client) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key.remoteJid;
    const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = messageBody.slice(1).trim().split(/\s+/).slice(1);

    if (!configManager.config?.users[number]) return;

    try {
        const option = args.join(' ').toLowerCase();
        if (option.includes("on")) {
            configManager.config.users[number].response = true;
            configManager.save();
            await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _*La réponse audio est activée*_' });
        } else if (option.includes("off")) {
            configManager.config.users[number].response = false;
            configManager.save();
            await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _*La réponse audio est désactivée*_' });
        } else {
            await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` _*Choisissez une option : on/off*_' });
        }
    } catch (error) {
        console.error("_Erreur changement option tag :_", error);
    }
}

// Export par défaut pour être importé via `import tag from './tag.js'`
export default { tagall, tagadmin, tag, settag, respond, tagoption };