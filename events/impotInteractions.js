module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Vérifier si c'est une interaction de modal
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'impotsModal') {
                try {
                    // Récupérer les valeurs du formulaire
                    const entreprise = interaction.fields.getTextInputValue('entrepriseInput');
                    const montantStr = interaction.fields.getTextInputValue('montantInput');
                    const montant = parseFloat(montantStr.replace(/[^0-9.-]+/g, '')); // Nettoyer et convertir en nombre

                    if (isNaN(montant)) {
                        return interaction.reply({ content: 'Le montant fourni est invalide.', ephemeral: true });
                    }

                    // Calculer les impôts en fonction du barème
                    let pourcentage = 0;

                    if (montant > 10000000) {
                        pourcentage = 40;
                    } else if (montant > 5000000) {
                        pourcentage = 35;
                    } else if (montant > 3000000) {
                        pourcentage = 30;
                    } else if (montant > 1500000) {
                        pourcentage = 25;
                    } else if (montant > 900000) {
                        pourcentage = 20;
                    } else if (montant > 500000) {
                        pourcentage = 15;
                    } else if (montant > 250000) {
                        pourcentage = 10;
                    } else if (montant > 100000) {
                        pourcentage = 5;
                    } else {
                        pourcentage = 0; // Si le montant est inférieur à 100 000
                    }

                    // Appliquer la formule pour calculer les impôts
                    const impots = montant * (pourcentage / 100);

                    // Format de l'annonce
                    const taxeMessage = `
### :flag_us: Taxes - ${entreprise}
***Bonjour à vous,***
**Après calcul nous vous informons que le montant à régler cette semaine est de** \`\`\`$${impots.toFixed(2)}\`\`\`
*Virement à effectuer au numéro de compte* \`\`\`5\`\`\`

**Merci et bonne soirée à vous !**
                    `;

                    // Envoyer le message dans le salon où la commande a été faite
                    await interaction.reply(taxeMessage);

                } catch (error) {
                    console.error('Erreur lors du calcul des impôts :', error);
                    await interaction.reply({ content: 'Une erreur est survenue lors du calcul des impôts.', ephemeral: true });
                }
            }
        }
    },
};
