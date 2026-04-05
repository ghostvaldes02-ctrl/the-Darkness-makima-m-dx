 // Lancer le serveur web en arrière-plan (pairing API)
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ne lancer le serveur web que si ce n'est pas déjà fait (éviter les doublons)
if (!process.env.WEB_SERVER_SPAWNED) {
    process.env.WEB_SERVER_SPAWNED = 'true';
    const webServer = spawn('node', ['web-server.js'], {
        stdio: 'inherit',
        cwd: __dirname,
        detached: false,
        env: { ...process.env, WEB_SERVER_SPAWNED: 'true' }
    });
    webServer.on('error', (err) => {
        console.error('❌ Impossible de lancer le serveur web:', err);
    });
    console.log('🌐 Serveur web de pairing lancé en parallèle');
}

// Ensuite, ton code existant :
import connectToWhatsApp from './auth/authHandler.js';
import handleIncomingMessage from './events/messageHandler.js';

(async () => {
    await connectToWhatsApp(handleIncomingMessage);
})();