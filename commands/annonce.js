const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('annonce')
        .setDescription('Créer une annonce pour un salon civil, entreprise ou gouvernement')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choisissez le type d\'annonce')
                .setRequired(true)
                .addChoices(
                    { name: 'Civil', value: 'civil' },
                    { name: 'Gouvernement', value: 'gouvernement' },
            		{ name: 'Entreprises', value: 'entreprise' }
                )
        ),
    async execute(interaction) {
        const type = interaction.options.getString('type');

        // Créer le modal (formulaire)
        const modal = new ModalBuilder()
            .setCustomId('annonceModal')
            .setTitle('Création d\'une annonce');

        // Créer les champs du formulaire
        const titleInput = new TextInputBuilder()
            .setCustomId('titleInput')
            .setLabel('Titre de l\'annonce')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const dateInput = new TextInputBuilder()
            .setCustomId('dateInput')
            .setLabel('Date de l\'annonce')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const bodyInput = new TextInputBuilder()
            .setCustomId('bodyInput')
            .setLabel('Corps de l\'annonce')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const nameInput = new TextInputBuilder()
            .setCustomId('nameInput')
            .setLabel('Nom Prénom')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const jobInput = new TextInputBuilder()
            .setCustomId('jobInput')
            .setLabel('Emploi')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Ajouter les champs au modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(dateInput),
            new ActionRowBuilder().addComponents(bodyInput),
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(jobInput)
        );

        // Afficher le formulaire (modal)
        await interaction.showModal(modal);

        // Stocker le type (Civil ou Gouvernement) dans l'interaction pour plus tard
        interaction.client.typeAnnonce = type;
    }
};
