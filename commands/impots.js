const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('impots')
        .setDescription('Calculer les impôts d\'une entreprise'),

    async execute(interaction) {
        // Créer le modal (formulaire)
        const modal = new ModalBuilder()
            .setCustomId('impotsModal')
            .setTitle('Calcul des impôts');

        // Champs du formulaire
        const entrepriseInput = new TextInputBuilder()
            .setCustomId('entrepriseInput')
            .setLabel('Nom de l\'entreprise')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const montantInput = new TextInputBuilder()
            .setCustomId('montantInput')
            .setLabel('Montant sur le compte ($)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Ajouter les champs au modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(entrepriseInput),
            new ActionRowBuilder().addComponents(montantInput)
        );

        // Montrer le formulaire à l'utilisateur
        await interaction.showModal(modal);
    },
};
