// commands/test.js
export async function execute(message, client, args) {
    const remoteJid = message.key.remoteJid;
    await client.sendMessage(remoteJid, { text: '> `Makima m-dx :` Test réussi !' });
}

export default execute;