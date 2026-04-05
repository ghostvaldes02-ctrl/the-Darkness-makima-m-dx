 // commands/makima-bug.js
import { sendWithContext } from '../utils/sendWithContext.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function convertToPTT(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec("libopus")
            .format("ogg")
            .audioBitrate("48k")
            .audioChannels(1)
            .save(outputPath)
            .on("end", () => resolve(outputPath))
            .on("error", reject);
    });
}

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    const totalSeconds = process.uptime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    const menuText = `
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
    〘 𝙈𝘼𝙆𝙄𝙈𝘼 𝘽𝙐𝙂 〙
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

▪︎ 𝑈𝑡𝑖𝑙𝑖𝑠𝑎𝑡𝑒𝑢𝑟 : ${message.pushName || "Inconnu"}
▪︎ 𝑈𝑝𝑡𝑖𝑚𝑒 : ${uptime}
▪︎ 𝑉𝑒𝑟𝑠𝑖𝑜𝑛 : 4.0
▪︎ 𝑇𝑦𝑝𝑒 : 𝚇-𝙼𝙳

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
      𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙀𝙎 𝘿𝙀 𝘽𝙐𝙂𝙎
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

🔹 𝘽𝙪𝙜𝙨 𝙛𝙤𝙣𝙙𝙖𝙢𝙚𝙣𝙩𝙖𝙪𝙭
   ▪︎ 𝙼𝙰𝙺𝙸𝙼𝙰-𝙾𝙵𝙵
   ▪︎ 𝙼𝙰𝙲𝙷𝙸𝙽𝙰𝚃𝙾𝚁
   ▪︎ 𝙶𝙷𝙾𝚂𝚃
   ▪︎ 𝚆𝙰𝚂𝚃𝙴𝙳
   ▪︎ 𝙲𝚁𝙰𝚉𝚈

🔹 𝘽𝙪𝙜𝙨 𝙖𝙫𝙖𝙣𝙘𝙚́𝙨
   ▪︎ 𝙼𝙰𝙺𝙸𝙼𝙰
   ▪︎ 𝚂𝙸𝙻𝙴𝙽𝙲𝙴

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
      ⊰ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚃𝙷𝙴 𝙳𝙰𝚁𝙺𝙽𝙴𝚂𝚂 ⊱
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
    `.trim();

    const imageUrl = "https://files.catbox.moe/h08up7.jpg";
    await sendWithContext(client, remoteJid, {
        image: { url: imageUrl },
        caption: `> \`Makima m-dx :\` ${menuText}`
    });

    const audioUrl = "https://files.catbox.moe/7mvdrw.mp3";
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const inputPath = path.join(tmpDir, `bugmenu_audio_${Date.now()}.mp3`);
    const outputPath = path.join(tmpDir, `bugmenu_audio_${Date.now()}.ogg`);

    try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Échec du téléchargement: ${response.status}`);
        const buffer = await response.buffer();
        fs.writeFileSync(inputPath, buffer);

        await convertToPTT(inputPath, outputPath);

        await client.sendMessage(remoteJid, {
            audio: { url: outputPath },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error('❌ Erreur lors du traitement de l\'audio du bug-menu :', err);
        await client.sendMessage(remoteJid, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: true
        }).catch(e => console.error('Fallback audio échoué:', e));
    }
}

export default execute;