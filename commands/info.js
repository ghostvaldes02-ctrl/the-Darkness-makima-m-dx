 // commands/info.js
import configManager from '../utils/manageConfigs.js';
import { BOT_NAME, OWNER_NAME } from '../config.js';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { sendWithContext } from '../utils/sendWithContext.js';

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

export default async function info(message, client) {
    const remoteJid = message.key.remoteJid;
    const today = new Date();
    const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const currentDay = daysOfWeek[today.getDay()];
    const currentDate = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const number = client.user.id.split(':')[0];
    const username = message.pushName || "Inconnu";
    const prefix = configManager.config?.users[number]?.prefix || '.';

    let commandCount = 0;
    try {
        const commandsPath = path.join(__dirname, '../commands');
        const files = fs.readdirSync(commandsPath);
        commandCount = files.filter(file => file.endsWith('.js')).length;
    } catch (err) {
        console.error('Erreur lors du comptage des commandes:', err);
    }

    const menuText = `
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
    〘 ${BOT_NAME} 〙
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

▪︎ 𝑃𝑟𝑒́𝑓𝑖𝑥 : ${prefix}
▪︎ 𝑈𝑡𝑖𝑙𝑖𝑠𝑎𝑡𝑒𝑢𝑟 : ${username}
▪︎ 𝐽𝑜𝑢𝑟 : ${currentDay}
▪︎ 𝐷𝑎𝑡𝑒 : ${currentDate}/${currentMonth}/${currentYear}
▪︎ 𝑉𝑒𝑟𝑠𝑖𝑜𝑛 : 𝟷.𝟶.𝟶
▪︎ 𝐶𝑜𝑚𝑚𝑎𝑛𝑑𝑒𝑠 : ${commandCount}
▪︎ 𝑇𝑦𝑝𝑒 : X-MD

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
          𝙈𝙀𝙉𝙐𝙎
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

🔹 𝙐𝙩𝙞𝙡𝙞𝙩𝙖𝙞𝙧𝙚𝙨
   ▪︎ ping        ▪︎ getid
   ▪︎ owner       ▪︎ device
   ▪︎ sudo        ▪︎ delsudo
   ▪︎ getsudo     ▪︎ test
   ▪︎ bugmenu

🔹 𝘾𝙤𝙣𝙛𝙞𝙜𝙪𝙧𝙖𝙩𝙞𝙤𝙣
   ▪︎ setprefix   ▪︎ welcome
   ▪︎ setonline   ▪︎ setpp
   ▪︎ getpp       ▪︎ autorecord
   ▪︎ autotype    ▪︎ autoreact
   ▪︎ statuslike  ▪︎ getconfig
   ▪︎ respons     ▪︎ settag

🔹 𝙂𝙧𝙤𝙪𝙥𝙚
   ▪︎ kick        ▪︎ kickall
   ▪︎ promote     ▪︎ demote
   ▪︎ promoteall  ▪︎ demoteall
   ▪︎ purge       ▪︎ mute
   ▪︎ unmute      ▪︎ bye
   ▪︎ gclink      ▪︎ antilink
   ▪︎ linkreset   ▪︎ approveall
   ▪︎ add

🔹 𝙈𝙚́𝙙𝙞𝙖
   ▪︎ sticker     ▪︎ vv
   ▪︎ dlt         ▪︎ save
   ▪︎ photo       ▪︎ toaudio
   ▪︎ take        ▪︎ url

🔹 𝙏𝙚́𝙡𝙚́𝙘𝙝𝙖𝙧𝙜𝙚𝙢𝙚𝙣𝙩
   ▪︎ img         ▪︎ play
   ▪︎ tiktok      ▪︎ pinterest
   ▪︎ video

🔹 𝙏𝙖𝙜𝙨
   ▪︎ tag         ▪︎ tagall
   ▪︎ tagadmin    ▪︎ tagoption

🔹 𝙎𝙚́𝙘𝙪𝙧𝙞𝙩𝙚́
   ▪︎ block       ▪︎ unblock
   ▪︎ warning     ▪︎ unwarn
   ▪︎ antidlt     ▪︎ antispam
   ▪︎ antipromote ▪︎ antidemote

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
      ⊰ 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 ${OWNER_NAME} ⊱
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
`.trim();

    await sendWithContext(client, remoteJid, {
        image: { url: "https://files.catbox.moe/k8jb3g.jpg" },
        caption: menuText
    }, { quoted: message });

    const audioUrl = "https://files.catbox.moe/3iw6th.mp3";
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const inputPath = path.join(tmpDir, `menu_audio_${Date.now()}.mp3`);
    const outputPath = path.join(tmpDir, `menu_audio_${Date.now()}.ogg`);

    try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Échec du téléchargement: ${response.status}`);
        const buffer = await response.buffer();
        fs.writeFileSync(inputPath, buffer);
        await convertToPTT(inputPath, outputPath);
        await client.sendMessage(remoteJid, {
            audio: { url: outputPath },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: false
        }, { quoted: message });
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error('❌ Erreur lors du traitement de l\'audio du menu :', err);
    }

    await client.sendMessage(remoteJid, {
        react: { text: '🗂', key: message.key }
    });
}