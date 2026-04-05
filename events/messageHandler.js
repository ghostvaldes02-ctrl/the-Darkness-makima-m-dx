 // events/messageHandler.js
import { pingCommand } from '../commands/ping.js';
import info from '../commands/info.js';
import react from '../commands/react.js';
import owner from '../commands/owner.js';
import reactions from '../commands/reactions.js';
import * as set from '../commands/set.js';
import tag from '../commands/tag.js';
import auto from '../commands/auto.js';
import presence from '../commands/online.js';
import channelSender from '../commands/channelSender.js';
import configManager, { save as saveConfig } from '../utils/manageConfigs.js';
import { OWNER_NUM } from '../config.js';
import fs from 'fs';

// Commandes existantes
import * as gpstatusCmd from '../commands/gpstatus.js';
import * as makimaBugCmd from '../commands/makima-bug.js';
import * as playCmd from '../commands/play.js';
import * as ppCmd from '../commands/pp.js';
import * as saveCmd from '../commands/save.js';
import * as stickerCmd from '../commands/sticker.js';
import * as sudo from '../commands/sudo.js';
import * as takeCmd from '../commands/take.js';
import * as testCmd from '../commands/test.js';
import * as uptimeCmd from '../commands/uptime.js';
import * as urlCmd from '../commands/url.js';
import * as videoCmd from '../commands/video.js';
import * as vvCmd from '../commands/vv.js';

// Autostatus
import { isAutoStatusEnabled, isStatusReactionEnabled, handleStatusUpdate, execute as autostatusCommand } from '../commands/autostatus.js';

// Nouvelles commandes
import * as addCmd from '../commands/add.js';
import * as welcomeCmd from '../commands/welcome.js';
import * as setgppCmd from '../commands/setgpp.js';
import * as getppCmd from '../commands/getpp.js';
import * as imgCmd from '../commands/img.js';
import * as resetlinkCmd from '../commands/resetlink.js';
import * as media from '../commands/media.js';
import * as group from '../commands/group.js';
import { getnewsid } from '../commands/getnewsid.js';

// ⭐ NOUVELLES COMMANDES AJOUTÉES
import { githubCommand } from '../commands/github.js';
import { groupInfoCommand } from '../commands/groupinfo.js';
import { lyricsCommand } from '../commands/lyrics.js';
import { quoteCommand } from '../commands/quote.js';
import { songCommand } from '../commands/song.js';
import { soraCommand } from '../commands/sora.js';

export let creator = ['237655374632@s.whatsapp.net'];
export let premium = [`${OWNER_NUM}@s.whatsapp.net`];

const ownerJid = OWNER_NUM + '@s.whatsapp.net';

async function handleIncomingMessage(event, client) {
    const number = client.user.id ? client.user.id.split(':')[0] : [];
    let userLid = '';
    try {
        const data = JSON.parse(fs.readFileSync(`sessions/${number}/creds.json`, 'utf8'));
        userLid = data?.me?.lid || client.user?.lid || '';
    } catch (e) {
        userLid = client.user?.lid || '';
    }
    const lid = userLid ? [userLid.split(':')[0] + "@lid"] : [];
    const messages = event.messages;
    const prefix = configManager.config?.users[number]?.prefix || '';

    for (const message of messages) {
        console.log(message);
        const messageBody = (message.message?.extendedTextMessage?.text || message.message?.conversation || '').toLowerCase();
        const remoteJid = message.key.remoteJid;
        const approvedUsers = configManager.config?.users[number]?.sudoList || [];
        const cleanParticipant = message.key?.participant ? message.key.participant.split("@") : [];
        const cleanRemoteJid = message.key?.remoteJid ? message.key.remoteJid.split("@") : [];

        if (!remoteJid) continue;

        // Gestion des statuts
        if (remoteJid === 'status@broadcast') {
            await handleStatusUpdate(client, message);
            continue;
        }

        auto.autotype(message, client);
        auto.autorecord(message, client);
        tag.respond(message, client, lid);
        presence(message, client, configManager.config?.users[number]?.online);
        reactions.auto(message, client, configManager.config?.users[number]?.autoreact, configManager.config?.users[number]?.emoji);

        const isFromMe = message.key.fromMe;
        const isSudo = approvedUsers.length > 0 && approvedUsers.includes(cleanParticipant[0] || cleanRemoteJid[0]);
        const isLid = Array.isArray(lid) && lid.includes(message.key.participant || message.key.remoteJid);
        
        if (messageBody.startsWith(prefix) && (isFromMe || isSudo || isLid)) {
            const commandAndArgs = messageBody.slice(prefix.length).trim();
            const parts = commandAndArgs.split(/\s+/);
            const command = parts[0];

            switch (command) {
                // Commandes existantes
                case 'ping':
                    await react(message, client);
                    await pingCommand(message, client);
                    break;
                case 'menu':
                    await react(message, client);
                    await info(message, client);
                    break;
                case 'owner':
                    await react(message, client);
                    await owner(message, client);
                    break;
                case 'uptime':
                case 'runtime':
                case 'botuptime':
                case 'alive':
                    await react(message, client);
                    await uptimeCmd.execute(message, client, parts.slice(1));
                    break;
                case 'sticker':
                    await react(message, client);
                    await stickerCmd.execute(message, client, parts.slice(1));
                    break;
                case 'play':
                    await react(message, client);
                    await playCmd.execute(message, client, parts.slice(1));
                    break;
                case 'setpp':
                    await react(message, client);
                    await ppCmd.execute(message, client);
                    break;
                case 'save':
                    await react(message, client);
                    await saveCmd.execute(message, client);
                    break;
                case 'take':
                    await react(message, client);
                    await takeCmd.execute(message, client, parts.slice(1));
                    break;
                case 'url':
                    await react(message, client);
                    await urlCmd.execute(message, client, parts.slice(1));
                    break;
                case 'vv':
                case 'viewonce':
                    await react(message, client);
                    await vvCmd.execute(message, client);
                    break;
                case 'video':
                    await react(message, client);
                    await videoCmd.execute(message, client);
                    break;
                case 'gpstatus':
                    await react(message, client);
                    await gpstatusCmd.execute(message, client, parts.slice(1));
                    break;
                case 'makima-bug':
                case 'bugmenu':
                    await react(message, client);
                    await makimaBugCmd.execute(message, client, parts.slice(1));
                    break;
                case 'test':
                    await react(message, client);
                    await testCmd.execute(message, client, parts.slice(1));
                    break;
                case 'autostatus':
                    await react(message, client);
                    await autostatusCommand(message, client, parts.slice(1), ownerJid, approvedUsers);
                    break;
                case 'sudo':
                    await react(message, client);
                    const sudoList = configManager.config?.users[number]?.sudoList || [];
                    await sudo.sudo(message, client, sudoList, parts.slice(1));
                    saveConfig();
                    break;
                case 'delsudo':
                    await react(message, client);
                    const delList = configManager.config?.users[number]?.sudoList || [];
                    await sudo.delsudo(message, client, delList, parts.slice(1));
                    saveConfig();
                    break;
                case 'getsudo':
                    await react(message, client);
                    const getList = configManager.config?.users[number]?.sudoList || [];
                    await sudo.getsudo(message, client, getList);
                    break;
                case 'setprefix':
                    await react(message, client);
                    await set.setprefix(message, client);
                    break;
                case 'setreaction':
                    await react(message, client);
                    await set.setreaction(message, client);
                    break;
                case 'setwelcome':
                    await react(message, client);
                    await set.setwelcome(message, client);
                    break;
                case 'autorecord':
                    await react(message, client);
                    await set.setautorecord(message, client);
                    break;
                case 'autotype':
                    await react(message, client);
                    await set.setautotype(message, client);
                    break;
                case 'setonline':
                    await react(message, client);
                    await set.setonline(message, client);
                    break;
                case 'autoreact':
                    await react(message, client);
                    await reactions.autoreact(message, client);
                    break;
                case 'tagall':
                    await react(message, client);
                    await tag.tagall(message, client);
                    break;
                case 'tag':
                    await react(message, client);
                    const isAuthorized = message.key.fromMe || message.key.participant === ownerJid || message.key.remoteJid === ownerJid || (Array.isArray(lid) && lid.includes(message.key.participant || message.key.remoteJid));
                    if (isAuthorized) {
                        try {
                            await tag.tag(message, client);
                        } catch (error) {}
                    } else {
                        await client.sendMessage(message.key.remoteJid, { text: "Commande réservée au propriétaire." });
                    }
                    break;
                case 'tagadmin':
                    await react(message, client);
                    await tag.tagadmin(message, client);
                    break;
                case 'settag':
                    await react(message, client);
                    await tag.settag(message, client);
                    break;
                case 'respons':
                    await react(message, client);
                    await tag.tagoption(message, client);
                    break;
                // Commandes de groupe
                case 'kick':
                    await react(message, client);
                    await group.kick(message, client);
                    break;
                case 'kickall':
                    await react(message, client);
                    await group.kickall(message, client);
                    break;
                case 'promote':
                    await react(message, client);
                    await group.promote(message, client);
                    break;
                case 'demote':
                    await react(message, client);
                    await group.demote(message, client);
                    break;
                case 'bye':
                    await react(message, client);
                    await group.bye(message, client);
                    break;
                case 'promoteall':
                    await react(message, client);
                    await group.pall(message, client);
                    break;
                case 'demoteall':
                    await react(message, client);
                    await group.dall(message, client, lid);
                    break;
                case 'mute':
                    await react(message, client);
                    await group.mute(message, client);
                    break;
                case 'unmute':
                    await react(message, client);
                    await group.unmute(message, client);
                    break;
                case 'gclink':
                    await react(message, client);
                    await group.gclink(message, client);
                    break;
                case 'purge':
                    await react(message, client);
                    await group.purge(message, client);
                    break;
                case 'getid':
                    await react(message, client);
                    await group.gcid(message, client);
                    break;
                case 'getnewsid':
                    await react(message, client);
                    await getnewsid(client, message, parts.slice(1));
                    break;
                case 'add':
                    await react(message, client);
                    await addCmd.execute(message, client, parts.slice(1));
                    break;
                case 'welcome':
                    await react(message, client);
                    await welcomeCmd.execute(message, client, parts.slice(1));
                    break;
                case 'setgpp':
                    await react(message, client);
                    await setgppCmd.execute(message, client, parts.slice(1));
                    break;
                case 'getpp':
                    await react(message, client);
                    await getppCmd.execute(message, client, parts.slice(1));
                    break;
                case 'img':
                    await react(message, client);
                    await imgCmd.execute(message, client, parts.slice(1));
                    break;
                case 'resetlink':
                    await react(message, client);
                    await resetlinkCmd.execute(message, client, parts.slice(1));
                    break;
                case 'photo':
                    await react(message, client);
                    await media.photo(message, client);
                    break;
                case 'toaudio':
                    await react(message, client);
                    await media.tomp3(message, client);
                    break;

                // ⭐ NOUVELLES COMMANDES
                case 'github':
                    await react(message, client);
                    await githubCommand(client, remoteJid, message, parts.slice(1)); // ✅ Correction : ajout des arguments
                    break;
                case 'groupinfo':
                    await react(message, client);
                    await groupInfoCommand(client, remoteJid, message);
                    break;
                case 'lyrics':
                    await react(message, client);
                    await lyricsCommand(client, remoteJid, message, parts.slice(1));
                    break;
                case 'quote':
                    await react(message, client);
                    await quoteCommand(client, remoteJid, message);
                    break;
                case 'song':
                    await react(message, client);
                    await songCommand(client, remoteJid, message, parts.slice(1));
                    break;
                case 'sora':
                    await react(message, client);
                    await soraCommand(client, remoteJid, message, parts.slice(1));
                    break;

                default:
                    break;
            }
        }
    }
}

export default handleIncomingMessage;