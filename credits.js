import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const api = "https://raw.githubusercontent.com/ghostvaldes02-ctrl/darkness-xmd/refs/heads/main/credits.json";
const localCredsPath = path.join(__dirname, 'credits.json');

let credsCache = null;

export async function getCreds() {
  if (credsCache) return credsCache;

  // 1. Essayer de lire le fichier local
  try {
    if (fs.existsSync(localCredsPath)) {
      const localData = JSON.parse(fs.readFileSync(localCredsPath, 'utf-8'));
      credsCache = localData;
      console.log("✅ Credits chargés depuis le fichier local.");
      return localData;
    }
  } catch (err) {
    console.error("Erreur lecture fichier local credits.json :", err.message);
  }

  // 2. Essayer le fetch distant
  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    credsCache = data;
    console.log("✅ Credits chargés depuis GitHub.");
    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération distante :", err.message);
    // 3. Fallback : valeurs par défaut
    const defaultCreds = {
      dev_name: "Darkness",
      number: "237655374632",
      telegram_id: "",
      bot_name: "𝗠𝗔𝗞𝗜𝗠𝗔 𝗠-𝗗𝗫",
      telegram_channel: "",
      telegram_group: "",
      wa_channel: "https://whatsapp.com/channel/0029VbBUNQO7NoZyYyKOK10m"
    };
    credsCache = defaultCreds;
    console.log("⚠️ Utilisation des valeurs par défaut pour credits.");
    return defaultCreds;
  }
}