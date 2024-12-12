const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        if (message.channel.type === ChannelType.DM) {
            const user = message.author;
            const guild = message.client.guilds.cache.first();
            const initialUserMessage = message.content;

            const existingTicket = guild.channels.cache.find(channel => 
                channel.topic === user.id && channel.parentId === config.roles.ticketCategory
            );

            if (existingTicket) {
                await existingTicket.send(`**${user.username}** : ${initialUserMessage}`);
                await message.react('valid:1302620060766179408');
                return;
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('confirmTicket').setLabel('Oui').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('cancelTicket').setLabel('Non').setStyle(ButtonStyle.Danger)
                );

            await message.channel.send({ content: "Voulez-vous ouvrir un ticket de support ?", components: [row] });

            const filter = interaction => interaction.user.id === user.id;
            const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'confirmTicket') {
                    const category = guild.channels.cache.get(config.roles.ticketCategory);
                    if (!category) return interaction.reply("La catégorie de tickets n'existe pas sur le serveur.", { ephemeral: true });

                    const ticketChannel = await guild.channels.create({
                        name: `ticket-${user.username}`, // Utiliser backticks pour l'interpolation
                        type: ChannelType.GuildText,
                        parent: category.id,
                        topic: user.id,
                        permissionOverwrites: [
                            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: config.roles.staff, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                        ]
                    });

                    const welcomeEmbed = new EmbedBuilder()
                        .setTitle("🎫 - Ticket Informations")
                        .setDescription(
                            `**Ticket ouvert il y a**: <t:${Math.floor(Date.now() / 1000)}:R>\n` +
                            `**Par**: ${user.tag}\n` +
                            `**Rejoint le**: ${new Date(user.createdAt).toLocaleDateString()}`
                        )
                        .addFields({ name: "Instructions", value: "Utilisez /fermer pour clôturer ce ticket." })
                        .setColor("#00AAFF");

                    await ticketChannel.send({ 
                        content: "**⚙️ Support:** Merci pour votre message, un(e) membre du gouvernement reviendra vers vous très vite !",
                        embeds: [welcomeEmbed]
                    });

                    await ticketChannel.send(`**${user.username}** : ${initialUserMessage}`);
                    await message.react('valid:1302620060766179408');
                    await interaction.reply({ content: "**⚙️ Support:** Ticket ouvert avec succès !", ephemeral: false });
                } else if (interaction.customId === 'cancelTicket') {
                    await interaction.reply({ content: "**⚙️ Support:** Ouverture de ticket annulée.", ephemeral: true });
                    await message.react('notvalid:1302620935123374142');
                }
                collector.stop();
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    message.channel.send("**⚙️ Support:** Demande expirée. Vous pouvez réessayer si vous avez besoin d’aide.");
                }
            });
            return;
        }

        if (message.channel.parentId === config.roles.ticketCategory && !message.author.bot) {
            const ticketOwner = message.channel.topic;

            if (!ticketOwner) {
                console.error("Erreur : L'ID du propriétaire du ticket est introuvable dans 'topic'.");
                return message.channel.send("Erreur : Impossible de récupérer l'utilisateur associé à ce ticket.");
            }

            try {
                const dmUser = await message.client.users.fetch(ticketOwner);
                if (message.content.startsWith("//")) return;

                const member = message.guild.members.cache.get(message.author.id);
                const highestRole = member ? member.roles.highest.name : "Staff";

                await dmUser.send(`**${highestRole} - ${message.author.username}** : ${message.content}`);
                await message.react('valid:1302620060766179408');
            } catch (error) {
                if (error.code === 50007) {
                    await message.channel.send("**⚠️ - Erreur :** Impossible d'envoyer un message en DM à l'utilisateur. Il a peut-être désactivé les messages privés ou n'est plus sur le serveur discord.");
                } else {
                    console.error("Erreur lors de la récupération de l'utilisateur :", error);
                    message.channel.send("Erreur : Impossible d'envoyer le message à l'utilisateur.");
                }
                await message.react('notvalid:1302620935123374142');
            }
        }

        if (!message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const cmd = message.client.commands.get(command);
        if (cmd) {
            cmd.execute(message, args);
        }
    }
};
