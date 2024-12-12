const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche toutes les commandes disponibles et leurs utilités'),
    
    async execute(interaction) {
        // Créer un embed pour afficher toutes les commandes
        const helpEmbed = new EmbedBuilder()
            .setColor('#00FF00') // Couleur du bord de l'embed
            .setTitle('Liste des commandes disponibles')
            .setDescription('Voici les commandes que vous pouvez utiliser avec le bot :')
            .addFields(
                { name: '/annonce', value: 'Créer une annonce pour le salon civil ou gouvernement.' },
				{ name: '/panel', value: 'Gestion des accès et administration des membres.' },
                { name: '/impots', value: 'Calculer les impôts à payer par une entreprise.' },
                { name: '/help', value: 'Affiche toutes les commandes disponibles et leurs utilités.' }
            )
            .setFooter({ text: 'Bot de gestion' });

        // Envoyer l'embed en réponse à la commande
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    },
};
