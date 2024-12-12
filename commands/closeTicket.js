const fs = require('fs');
const path = require('path');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'fermer',
        description: 'Ferme le ticket et génère un log du salon'
    },
    async execute(interaction) {
        const channel = interaction.channel;

        // Vérification de la configuration des rôles et de la catégorie de ticket
        const ticketCategory = interaction.client.config?.roles?.ticketCategory;
        const staffRole = interaction.client.config?.roles?.staff;
        const logChannelId = interaction.client.config?.channels?.logChannel;
        const logDirPath = path.join(__dirname, '../logs');

        if (!fs.existsSync(logDirPath)) {
            fs.mkdirSync(logDirPath, { recursive: true });
        }

        if (!ticketCategory || !staffRole || !logChannelId) {
            return interaction.reply({ content: "Erreur : Configuration incomplète. Vérifiez le fichier config.json.", ephemeral: true });
        }

        // Vérification que le channel appartient bien à la catégorie de tickets
        if (channel.parentId !== ticketCategory) {
            return interaction.reply({ content: "Cette commande ne peut être utilisée que dans un channel de ticket.", ephemeral: true });
        }

        const ticketOwnerId = channel.topic;
        const ticketOwner = await interaction.client.users.fetch(ticketOwnerId);

        // Envoyer un message à l'utilisateur pour l'informer de la fermeture du ticket
        const closeEmbed = new EmbedBuilder()
            .setTitle("🎫 Ticket Fermé")
            .setDescription("Votre ticket a été fermé. Si vous avez besoin d'aide, n'hésitez pas à nous recontacter.")
            .setColor("#FF0000")
            .setTimestamp();

        await ticketOwner.send({ embeds: [closeEmbed] }).catch(console.error);

        try {
            // Récupération de tous les messages du channel
            const messages = await channel.messages.fetch({ limit: 100 });
            const logArray = [];

            // Formatage des messages pour le fichier de log
            messages.reverse().forEach(msg => {
                const timestamp = msg.createdAt.toLocaleString();
                const author = `${msg.author.tag} (${msg.author.id})`;
                logArray.push(`[${timestamp}] ${author}: ${msg.content}`);
            });

            // Chemin et contenu du fichier log
            const logPath = path.join(logDirPath, `ticket-${channel.id}.txt`);
            const logContent = logArray.join('\n');

            // Écrire dans un fichier .txt
            fs.writeFileSync(logPath, logContent, 'utf-8');

            // Créer une pièce jointe pour envoyer le fichier
            const attachment = new AttachmentBuilder(logPath);

            // Message de confirmation de fermeture
            const embed = new EmbedBuilder()
                .setTitle("Ticket Fermé")
                .setDescription("Le ticket a été fermé avec succès et les logs ont été générés.")
                .setColor("#FF0000")
                .setTimestamp();

            // Envoyer le fichier de log dans un channel de logs
            const logChannel = interaction.client.channels.cache.get(logChannelId);
            if (logChannel) {
                await logChannel.send({ content: `Logs du ticket ${channel.name}`, files: [attachment] });
            } else {
                await interaction.followUp({ content: "Le fichier de log a été généré mais le channel de logs est introuvable.", files: [attachment] });
            }

            // Informer l'utilisateur avec un embed
            await interaction.reply({ embeds: [embed] });

            // Supprimer le channel de ticket
            setTimeout(() => channel.delete(), 5000);

            // Supprimer le fichier local après envoi
            fs.unlinkSync(logPath);
        } catch (error) {
            console.error("Erreur lors de la fermeture du ticket:", error);
            interaction.reply({ content: "Une erreur est survenue lors de la fermeture du ticket.", ephemeral: true });
        }
    }
};
