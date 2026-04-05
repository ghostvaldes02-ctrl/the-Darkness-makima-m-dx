 // web-server.js
import express from 'express';
import cors from 'cors';
import startSession from './utils/connector.js';
import handleIncomingMessage from './events/messageHandler.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.WEB_PORT || 19113;

// CORS large pour accepter Chrome (et tous les navigateurs)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));

// Vérifier dossier web
const webDir = path.join(__dirname, 'web');
if (!fs.existsSync(webDir)) fs.mkdirSync(webDir, { recursive: true });

const pendingPairings = new Map();

app.post('/api/pair', async (req, res) => {
    const { number } = req.body;
    if (!number || !/^\d{9,15}$/.test(number)) {
        return res.status(400).json({ error: 'Numéro invalide (ex: 237671410035)' });
    }
    if (pendingPairings.has(number)) {
        return res.status(409).json({ error: 'Une demande est déjà en cours' });
    }

    let resolveCode, timeoutId;
    const codePromise = new Promise((resolve, reject) => {
        resolveCode = (code, error) => {
            if (error) reject(new Error(error));
            else resolve(code);
        };
    });
    pendingPairings.set(number, resolveCode);
    timeoutId = setTimeout(() => {
        if (pendingPairings.has(number)) {
            pendingPairings.delete(number);
            resolveCode(null, 'Délai dépassé');
        }
    }, 60000);

    try {
        await startSession(
            number,
            handleIncomingMessage,
            false,
            (code, error) => {
                if (error) resolveCode(null, error);
                else if (code) resolveCode(code);
                pendingPairings.delete(number);
                clearTimeout(timeoutId);
            }
        );
    } catch (err) {
        pendingPairings.delete(number);
        clearTimeout(timeoutId);
        return res.status(500).json({ error: err.message });
    }

    try {
        const code = await codePromise;
        res.json({ success: true, code });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Interface web disponible sur http://0.0.0.0:${PORT}`);
    console.log(`📡 API d'appairage : POST /api/pair`);
});