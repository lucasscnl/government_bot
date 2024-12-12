const { ChannelType } = require('discord.js');
const config = require('../config.json'); // Importer le fichier config

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Vérifier si c'est une interaction de modal
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'annonceModal') {
                try {
                    // Récupérer les valeurs du formulaire
                    const title = interaction.fields.getTextInputValue('titleInput');
                    const date = interaction.fields.getTextInputValue('dateInput');
                    const body = interaction.fields.getTextInputValue('bodyInput');
                    const name = interaction.fields.getTextInputValue('nameInput');
                    const job = interaction.fields.getTextInputValue('jobInput');

                    // Déterminer où envoyer l'annonce (salon civil ou gouvernement) et quel rôle mentionner
                    const typeAnnonce = interaction.client.typeAnnonce;
                    let channelId;
                    let rolesToMention = [];

                    if (typeAnnonce === 'civil') {
                        channelId = config.annonces.civil; 
                        rolesToMention.push(config.roles.citoyen);
                    } else if (typeAnnonce === 'gouvernement') {
                        channelId = config.annonces.gouvernement;
                        rolesToMention.push(config.roles.gouvernement);
                    } else if (typeAnnonce === 'entreprise') {
                        channelId = config.annonces.entreprise;
                        rolesToMention = config.roles.entreprise;
                    }

                    // Format de l'annonce avec la mention des rôles
                    const mentions = rolesToMention.map(roleId => `<@&${roleId}>`).join(' ');
                    const annonceMessage = `
### :flag_us: ${title} - ${date}

${body}

### ${name} - ${job}

|| ${mentions} ||`;

                    // Envoyer l'annonce dans le salon approprié
                    const channel = interaction.guild.channels.cache.get(channelId);
                    if (channel && channel.type === ChannelType.GuildText) {
                        const message = await channel.send(annonceMessage); // Stocker le message envoyé
                        await message.react('valid:1302620060766179408'); // Réagir avec l'émoji
                        await interaction.reply({ content: 'Annonce envoyée avec succès !', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Le salon est introuvable ou invalide.', ephemeral: true });
                    }
                } catch (error) {
                    console.error('Erreur lors de l\'envoi de l\'annonce :', error);
                    await interaction.reply({ content: 'Une erreur est survenue lors de l\'envoi de l\'annonce.', ephemeral: true });
                }
            }
        }
    },
};
