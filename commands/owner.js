 // commands/owner.js
import { OWNER_NUM, OWNER_NAME } from '../config.js';

export async function owner(message, client) {
    const remoteJid = message.key.remoteJid;
    const vcard = 'BEGIN:VCARD\nVERSION:3.0\n' +
        `FN: ${OWNER_NAME}\n` +
        `ORG: ${OWNER_NAME};\n` +
        `TEL;type=CELL;type=VOICE;waid=${OWNER_NUM}:+${OWNER_NUM}\n` +
        'END:VCARD';
    await client.sendMessage(remoteJid, {
        contacts: { displayName: `_*${OWNER_NAME}*_`, contacts: [{ vcard }] }
    });
}

export default owner;