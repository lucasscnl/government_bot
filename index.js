// index.js
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
const config = require('./config.json');
const messageCreate = require('./events/messageCreate.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.ticketLogs = new Collection();
client.config = config;
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const guildIds = ['1271444465877258241', '975443439434993725'];

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`); 
    client.user.setActivity('MP pour ticket Gouv', { type: ActivityType.Reading });
    client.user.setStatus('dnd');
    client.user.setAvatar('./avatar.png')
        .then(user => console.log(`Nouvel avatar défini !`))
        .catch(console.error);
    
    try {
        for (const guildId of guildIds) {
            console.log(`Déploiement sur le serveur ID : ${guildId}`);

            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                await guild.commands.set(client.commands.map(cmd => cmd.data));
                console.log(`Commandes slash déployées sur le serveur : ${guild.name}`);
            } else {
                console.log(`Le serveur avec l'ID ${guildId} n'est pas accessible.`);
            }
        }
    } catch (error) {
        console.error('Erreur lors du déploiement des commandes slash:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
    }
});

client.login(config.token);
