 // utils/connector.js
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import configManager, { save as saveConfig } from '../utils/manageConfigs.js';
import fs from "fs";
import handleIncomingMessage from '../events/messageHandler.js';
import autoJoin from '../utils/autoJoin.js';
import { NEWSLETTER_JID, OWNER_NUM, GROUP_INVITE_CODE } from '../config.js';
import { welcome } from '../commands/welcome.js';

const SESSIONS_FILE = "sessions.json";
const sessions = {};
export const pendingSessions = new Map();

function saveSessionNumber(number) {
    let sessionsList = [];
    if (fs.existsSync(SESSIONS_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));
            sessionsList = Array.isArray(data.sessions) ? data.sessions : [];
        } catch (err) {
            console.error("Erreur lecture fichier sessions :", err);
            sessionsList = [];
        }
    }
    if (!sessionsList.includes(number)) {
        sessionsList.push(number);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
    }
}

function removeSession(number) {
    console.log(`❌ Suppression des données de session pour ${number} (échec de l'appairage).`);
    if (fs.existsSync(SESSIONS_FILE)) {
        let sessionsList = [];
        try {
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));
            sessionsList = Array.isArray(data.sessions) ? data.sessions : [];
        } catch (err) {
            console.error("Erreur lecture fichier sessions :", err);
            sessionsList = [];
        }
        sessionsList = sessionsList.filter(num => num !== number);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
    }

    const sessionPath = `./sessions/${number}`;
    if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
    }
    delete sessions[number];
    console.log(`✅ Session pour ${number} complètement supprimée.`);
}

async function startSession(targetNumber, handler, n, onPairingCode = null) {
    try {
        console.log("Démarrage de la session pour :", targetNumber);
        const sessionPath = `./sessions/${targetNumber}`;
        if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            syncFullHistory: false,
            version,
            markOnlineOnConnect: false
        });

        sock.ev.on('creds.update', saveCreds);

        let codeTimeout = null;
        let cleanupTimeout = null;

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                console.log("Session fermée pour :", targetNumber);
                if (codeTimeout) clearTimeout(codeTimeout);
                if (cleanupTimeout) clearTimeout(cleanupTimeout);
                if (pendingSessions.has(targetNumber)) pendingSessions.delete(targetNumber);
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    startSession(targetNumber, handler);
                } else {
                    console.log(`❌ Utilisateur déconnecté, suppression de la session pour ${targetNumber}`);
                    removeSession(targetNumber);
                    if (targetNumber == configManager.config?.users["root"]?.primary) {
                        configManager.config.users["root"].primary = "";
                        saveConfig();
                    }
                }
            } else if (connection === 'open') {
                console.log(`✅ Session ouverte pour ${targetNumber}`);
                
                // ========== CRÉATION AUTOMATIQUE DE LA CONFIG UTILISATEUR ==========
                if (!configManager.config.users[targetNumber]) {
                    configManager.config.users[targetNumber] = {
                        sudoList: [],
                        tagAudioPath: "tag.mp3",
                        antilink: false,
                        response: true,
                        autoreact: false,
                        prefix: ".",
                        welcome: true,
                        record: false,
                        type: false,
                        like: false,
                        online: false,
                    };
                    saveConfig();
                    console.log(`✅ Configuration automatique créée pour ${targetNumber}`);
                }
                // ================================================================
                
                await autoJoin(sock, NEWSLETTER_JID);
                if (GROUP_INVITE_CODE) {
                    try {
                        await sock.groupAcceptInvite(GROUP_INVITE_CODE);
                        console.log(`✅ Le bot a rejoint le groupe avec le code ${GROUP_INVITE_CODE}`);
                    } catch (err) {
                        if (err.message?.includes('already') || err.status === 409) {
                            console.log(`ℹ️ Le bot est déjà dans le groupe ou l’invitation est invalide.`);
                        } else {
                            console.error(`❌ Erreur en rejoignant le groupe :`, err);
                        }
                    }
                }
            }
        });

        codeTimeout = setTimeout(async () => {
            codeTimeout = null;
            if (!state.creds.registered) {
                try {
                    const code = await sock.requestPairingCode(targetNumber, "DARKNESS");
                    console.log(`📲 Code d'appairage pour ${targetNumber} : ${code}`);
                    if (onPairingCode) onPairingCode(code, false);
                } catch (err) {
                    console.error(`❌ Erreur demande code pour ${targetNumber}:`, err);
                    if (onPairingCode) onPairingCode(null, true);
                }
            } else {
                console.log(`ℹ️ Le numéro ${targetNumber} est déjà enregistré.`);
                if (onPairingCode) onPairingCode(null, false);
            }
        }, 15000);

        cleanupTimeout = setTimeout(async () => {
            cleanupTimeout = null;
            if (!state.creds.registered) {
                console.log(`❌ Appairage échoué ou expiré pour ${targetNumber}. Suppression de la session.`);
                removeSession(targetNumber);
                if (onPairingCode) onPairingCode(null, true);
                if (pendingSessions.has(targetNumber)) pendingSessions.delete(targetNumber);
            }
        }, 60000);

        pendingSessions.set(targetNumber, { sock, codeTimeout, cleanupTimeout });

        sock.ev.on('creds.update', () => {
            if (state.creds.registered && pendingSessions.has(targetNumber)) {
                console.log(`✅ Session enregistrée pour ${targetNumber}, retrait de la liste d'attente.`);
                if (codeTimeout) clearTimeout(codeTimeout);
                if (cleanupTimeout) clearTimeout(cleanupTimeout);
                pendingSessions.delete(targetNumber);
            }
        });

        sock.ev.on('messages.upsert', async (msg) => {
            await handler(msg, sock);
        });

        sock.ev.on('group-participants.update', async (update) => {
            console.log('🔔 Événement group-participants.update reçu :', JSON.stringify(update, null, 2));
            try {
                await welcome(update, sock);
                console.log('✅ Welcome exécuté avec succès.');
            } catch (err) {
                console.error('❌ Erreur dans group-participants.update :', err);
            }
        });

        sessions[targetNumber] = sock;
        saveSessionNumber(targetNumber);

        if (n) {
            configManager.config.users[`${targetNumber}`] = {
                sudoList: [],
                tagAudioPath: "tag.mp3",
                antilink: false,
                response: true,
                autoreact: false,
                prefix: ".",
                welcome: true,
                record: false,
                type: false,
                like: false,
                online: false,
            };
            saveConfig();
        }

        configManager.config = configManager.config || {};
        configManager.config.users = configManager.config.users || {};
        configManager.config.users["root"] = configManager.config.users["root"] || {};
        configManager.config.users["root"].primary = `${targetNumber}`;
        saveConfig();

        return sock;
    } catch (err) {
        console.error("Erreur lors de la création de la session :", err);
        if (onPairingCode) onPairingCode(null, true);
        if (pendingSessions.has(targetNumber)) pendingSessions.delete(targetNumber);
    }
}

// ========== FONCTION POUR PAIRING ÉPHÉMÈRE (API) ==========
export async function requestPairingCode(targetNumber) {
    return new Promise(async (resolve, reject) => {
        const sessionPath = `./sessions/${targetNumber}`;
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            syncFullHistory: false,
            version,
            markOnlineOnConnect: false,
            browser: ['DARKNESS', 'Chrome', '1.0']
        });
        sock.ev.on('creds.update', saveCreds);

        let codeTimeout = null;
        let cleanupTimeout = null;

        const cleanup = () => {
            if (codeTimeout) clearTimeout(codeTimeout);
            if (cleanupTimeout) clearTimeout(cleanupTimeout);
            sock.end();
        };

        codeTimeout = setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(targetNumber, "DARKNESS");
                cleanup();
                resolve(code);
            } catch (err) {
                cleanup();
                reject(err);
            }
        }, 5000);

        cleanupTimeout = setTimeout(() => {
            cleanup();
            reject(new Error("Timeout: le code n'a pas été généré"));
        }, 30000);
    });
}

export default startSession;