 // utils/manageConfigs.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const configPath = path.join(process.cwd(), 'config.json');
let config = {};

if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (err) {
        console.error('Erreur lors du chargement de config.json :', err);
        config = {};
    }
}

if (!config.users) config.users = {};
if (!config.groups) config.groups = {};
if (!config.chatbot) config.chatbot = {};

const saveConfig = () => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (err) {
        console.error('Erreur lors de la sauvegarde de config.json :', err);
    }
};

export default {
    config,
    save: saveConfig
};

// ✅ Ajout de l'export nommé pour résoudre l'erreur "save is not a function"
export const save = saveConfig;