import configManager from '../utils/manageConfigs.js';
import readline from 'readline';
import startSession from '../utils/connector.js';

async function promptUserNumber() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('', (number) => {
            rl.close();
            resolve(number.trim());
        });
    });
}

async function connectToWhatsApp(handleMessage) {
    console.log(`
　　　⢀⡤⠔⠒⠒⢌⡛⠒⢦⣄⠀⠀⠀⠀⠀
　　⡠⠚⠁　⣀⡠⠒⠚⡄⠑　⠈⠳⡄⠀⠀⠀
　⢀⡞⠁⠠⠦　　　⠸⠠⠀　⢀⠤⠜⣆⠀⠀
⢀⡎　　⠡⡀　⠐⠂　⠈　　⣁⠀⣀⣸⡆⠀
⢸⠀⡤⡀　⡧　　　⠠⠤　⠨　　　⢧⠀
⠀⢧　⠈⢀⠆⣤⣤⣶⣶⣦⣤⠁⢀⠔⣢⣴⣶⢨⠇
　⠘⡆⡄　 ⣿⣿⣿⣿⣿⣿⡆　⣼⣿⣿⣿⡏⠀
　　⢻⠀⠇　⠙⢿⣿⣿⡿⢿⠁ ⠻⠿⠿⢿⡅⠀
⠀⠀⢈⡷⢼⠈⢈⣀⠠　⠐⠊⢀⣾⡟⣦⠤⠼⠁⠀
　　⠘⣆⠅⣽⠉⠘⡆⠆　⢀⠛⠓⡁⢻⠀⠀⠀⠀
　　　⢺⠐⠙⢦⢀⡧⣈⣘⣈⣀⣢⣣⣾⠀⠀⠀⠀
　　　⠈⠳⢌⠈⠛⢷⣓⡜⢤⠧⡗⣿⡇⠀⠀⠀⠀
　　　　　⠳⣄⠀⠀⠉⠍⠉⡀⡞⠀⠀⠀⠀⠀
　　　　　　⠉⠑⠲⠤⠴⠚⠁⠀⠀⠀⠀⠀⠀⠀ 
𝐌𝐀𝐊𝐈𝐌𝐀 𝐄𝐒𝐓 𝐏𝐑𝐄̂𝐓𝐄 ☻𓅂🌹
⠀⠀⠀`);

    console.log("📲 Entrez votre numéro WhatsApp (avec indicatif, ex: 237xxxx) : ");

    const primary = configManager.config?.users["root"]?.primary;

    if (!primary) {
        const number = await promptUserNumber();
        await startSession(number, handleMessage, true);
    } else {
        const number = primary;
        await startSession(number, handleMessage, false);
    }
}

export default connectToWhatsApp;