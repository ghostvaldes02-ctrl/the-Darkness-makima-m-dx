import fs from 'fs'

function sessionCount(sessionFile = './sessions.json') {
    try {
        const data = fs.readFileSync(sessionFile, 'utf-8');
        const sessionObj = JSON.parse(data);
        let activeCount = 0;
        if (sessionObj.sessions) {
            for (const sessionId in sessionObj.sessions) {
                const session = sessionObj.sessions[sessionId];
                activeCount++;
            }
        }
        return activeCount;
    } catch (error) {
        console.error('Impossible de lire le fichier de sessions :', error.message);
        return 0;
    }
}

export default sessionCount;