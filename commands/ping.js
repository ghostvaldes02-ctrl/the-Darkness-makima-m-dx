 // commands/ping.js
export async function pingCommand(message, client) {
    const remoteJid = message.key.remoteJid;
    const startTime = Date.now();
    const sentMessage = await client.sendMessage(remoteJid, { text: '> 𝙸 𝙰𝙼 𝙴𝚅𝙸𝙻...?' });
    const latency = Date.now() - startTime;
    await client.sendMessage(remoteJid, {
        text: `> \`Makima m-dx :\` 🫴 ${latency} ms`
    });
}

export default pingCommand;