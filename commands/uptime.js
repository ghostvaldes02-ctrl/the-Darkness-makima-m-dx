 // commands/uptime.js
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { sendWithContext } from '../utils/sendWithContext.js';

const execPromise = promisify(exec);
const STATS_IMAGE = 'https://files.catbox.moe/0rdi18.jpg';

function formatUptime(seconds) {
    if (seconds <= 0) return '0 seconde';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} seconde${secs > 1 ? 's' : ''}`);
    return parts.join(', ');
}

function getCpuLoad() {
    const loads = os.loadavg();
    return `${loads[0].toFixed(2)} (1m) | ${loads[1].toFixed(2)} (5m) | ${loads[2].toFixed(2)} (15m)`;
}

function getRamInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percent = (used / total * 100).toFixed(1);
    const formatBytes = (bytes) => (bytes / (1024 ** 3)).toFixed(2) + ' GB';
    return `${formatBytes(used)} / ${formatBytes(total)} (${percent}%)`;
}

async function getDiskInfo() {
    try {
        const { stdout } = await execPromise('df -h .');
        const lines = stdout.trim().split('\n');
        if (lines.length < 2) return 'N/A';
        const parts = lines[1].split(/\s+/);
        const used = parts[2];
        const total = parts[1];
        const percent = parts[4];
        return `${used} / ${total} (${percent})`;
    } catch (err) {
        console.error('Erreur récupération disque:', err);
        return 'N/A';
    }
}

export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    await client.sendMessage(remoteJid, { react: { text: '⏳', key: message.key } }).catch(() => {});
    try {
        const uptime = formatUptime(process.uptime());
        const cpuLoad = getCpuLoad();
        const ram = getRamInfo();
        const disk = await getDiskInfo();
        const caption = `> \`𝗠𝗔𝗞𝗜𝗠𝗔 𝗠-𝗗𝗫\` 
╭✧ 𝚂𝙴𝚁𝚅𝙴𝚄𝚁 𝚂𝚃𝙰𝚃𝚄𝚃 ✧
╰✧ ✧┄┄┄┄┄┄┄┄┄┄┄┄┄◈
🕒 *Uptime* : ${uptime}
💻 *CPU* (load average) : ${cpuLoad}
🧠 *RAM* (utilisée / totale) : ${ram}
💾 *Disque* (utilisé / total) : ${disk}
◈┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈
> 𝙱𝚈 𝚃𝙷𝙴 𝙳𝙰𝚁𝙺𝙽𝙴𝚂𝚂
`;
        await sendWithContext(client, remoteJid, {
            image: { url: STATS_IMAGE },
            caption
        }, { quoted: message });
        await client.sendMessage(remoteJid, { react: { text: '✅', key: message.key } }).catch(() => {});
    } catch (error) {
        console.error('Erreur uptime:', error);
        await sendWithContext(client, remoteJid, {
            text: '> `Makima m-dx :` ❌ Impossible de récupérer les statistiques.'
        }, { quoted: message });
    }
}

export default execute;