// autoJoin.js
async function autoJoin(sock, channelId, cont) {
    const jid = channelId; // ID de la newsletter cible
    const queryId = '24404358912487870'; // À remplacer par l'ID de requête réel si nécessaire
    const encoder = new TextEncoder();
    const server = 's.whatsapp.net';

    const joinNode = {
        tag: 'iq',
        attrs: {
            id: sock.generateMessageTag(),
            type: 'get',
            xmlns: 'w:mex',
            to: server,
        },
        content: [
            {
                tag: 'query',
                attrs: { 'query_id': queryId },
                content: encoder.encode(JSON.stringify({
                    variables: {
                        newsletter_id: jid,
                        ...(cont || {})
                    }
                }))
            }
        ]
    };

    const fetchNode = {
        tag: 'iq',
        attrs: {
            id: sock.generateMessageTag(),
            type: 'get',
            xmlns: 'newsletter',
            to: server,
        },
        content: [
            {
                tag: 'messages',
                attrs: {
                    type: 'jid',
                    jid: jid,
                    count: '1'
                },
                content: [] // ne jamais utiliser null ici
            }
        ]
    };

    try {
        const joinResponse = await sock.query(joinNode);
        console.log(`✅ Requête d'abonnement envoyée : ${jid}`, joinResponse);
    } catch (err) {
        console.error('❌ Erreur dans la fonction autoJoin :', err);
    }
};

export default autoJoin;