module.exports = {
    name: 'ready',
    once: true, // Cet événement ne s'exécute qu'une seule fois (lors du démarrage)
    execute(client) {
        console.log(`Connecté en tant que ${client.user.tag}`);
    }
};
