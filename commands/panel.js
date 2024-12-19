const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Affiche un panel pour la gestion des utilisateurs')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à gérer')
                .setRequired(true)),

    async execute(interaction) {
        // Vérifier si l'utilisateur a le rôle requis pour accéder au panel
        const requiredRole = config.roles.panelAccess; // Rôle requis pour ouvrir le panel
        if (!interaction.member.roles.cache.has(requiredRole)) {
            return interaction.reply({ content: "***- :x: Vous n'avez pas le rôle nécessaire pour utiliser cette commande.***", ephemeral: true });
        }

        const targetUser = interaction.options.getMember('utilisateur');
        if (!targetUser) {
            return interaction.reply("***- :x: Utilisateur invalide.***");
        }

        const embed = new EmbedBuilder()
            .setTitle(`***:hammer_pick: Panel de gestion*** - ${targetUser.user.tag}`)
            .setThumbnail(targetUser.user.displayAvatarURL())
            .addFields(
                { name: 'ID Utilisateur', value: targetUser.id, inline: true },
                { name: 'Créé le', value: new Date(targetUser.user.createdAt).toLocaleDateString(), inline: true },
                { name: 'Rejoint le', value: new Date(targetUser.joinedAt).toLocaleDateString(), inline: true }
            )
            .setColor('#00AAFF');

        const adminButton = new ButtonBuilder()
            .setCustomId('admin')
            .setLabel('Administration')
            .setStyle(ButtonStyle.Danger);

        const manageButton = new ButtonBuilder()
            .setCustomId('manage')
            .setLabel('Gestion')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(adminButton, manageButton);

        // Utilisation de deferReply pour éviter l'expiration de l'interaction
        await interaction.deferReply();

        await interaction.editReply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'admin' || i.customId === 'manage';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'admin') {
                await showAdminPanel(i, targetUser);
            } else if (i.customId === 'manage') {
                await showManagePanel(i, targetUser, interaction.guild);
            }
        });
    }
};

async function showAdminPanel(interaction, targetUser) {
    const kickButton = new ButtonBuilder()
        .setCustomId('kick')
        .setLabel('Kick')
        .setStyle(ButtonStyle.Danger);

    const banButton = new ButtonBuilder()
        .setCustomId('ban')
        .setLabel('Ban')
        .setStyle(ButtonStyle.Danger);

    const muteButton = new ButtonBuilder()
        .setCustomId('mute')
        .setLabel('Mute')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(kickButton, banButton, muteButton);

    await interaction.update({ content: 'Administration :', components: [row] });

    const filter = i => ['kick', 'ban', 'mute'].includes(i.customId);
    const collector = interaction.message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async action => {
        if (action.customId === 'kick') {
            await targetUser.kick();
            await action.reply(`**:gear: Sanction:** ${targetUser.user.tag} a été expulsé ✅.`);
        } else if (action.customId === 'ban') {
            await targetUser.ban();
            await action.reply(`**:gear: Sanction:** ${targetUser.user.tag} a été banni ✅.`);
        } else if (action.customId === 'mute') {
            await action.reply(`**:gear: Sanction:** ${targetUser.user.tag} a été muté ✅.`);
        }
    });
}

async function showManagePanel(interaction, targetUser, guild) {
    const recruitButton = new ButtonBuilder()
        .setCustomId('recruit')
        .setLabel('Recruter')
        .setStyle(ButtonStyle.Success);

    const fireButton = new ButtonBuilder()
        .setCustomId('fire')
        .setLabel('Virer')
        .setStyle(ButtonStyle.Danger);

    const lspdButton = new ButtonBuilder()
        .setCustomId('lspd')
        .setLabel('Accès LSPD')
        .setStyle(ButtonStyle.Primary);

    const emsButton = new ButtonBuilder()
        .setCustomId('ems')
        .setLabel('Accès EMS')
        .setStyle(ButtonStyle.Primary);

    const bcsoButton = new ButtonBuilder()
        .setCustomId('bcso')
        .setLabel('Accès BCSO')
        .setStyle(ButtonStyle.Primary);

    const bcmsButton = new ButtonBuilder()
        .setCustomId('bcms')
        .setLabel('Accès BCMS')
        .setStyle(ButtonStyle.Primary);

    const usssButton = new ButtonBuilder()
        .setCustomId('usss')
        .setLabel('Accès USSS')
        .setStyle(ButtonStyle.Primary);
    
    const patronButton = new ButtonBuilder()
        .setCustomId('patron')
        .setLabel('Accès Patron')
        .setStyle(ButtonStyle.Secondary);
    
    const copatronButton = new ButtonBuilder()
        .setCustomId('copatron')
        .setLabel('Accès Co-Patron')
        .setStyle(ButtonStyle.Secondary);
    
    const wlrecrutementButton = new ButtonBuilder()
        .setCustomId('wlrecrutement')
        .setLabel('WL Recrutement')
        .setStyle(ButtonStyle.Secondary);
    
    const wlbotButton = new ButtonBuilder()
        .setCustomId('wlbot')
        .setLabel('WL Bot')
        .setStyle(ButtonStyle.Secondary);

    const row1 = new ActionRowBuilder().addComponents(recruitButton, fireButton, wlrecrutementButton, wlbotButton);
    const row2 = new ActionRowBuilder().addComponents(lspdButton, emsButton, bcsoButton, bcmsButton, usssButton);
    const row3 = new ActionRowBuilder().addComponents(patronButton, copatronButton);

    await interaction.update({ content: '***Gestion :***', components: [row1, row2, row3] });

    const filter = i => ['recruit', 'fire', 'lspd', 'ems', 'bcso', 'bcms', 'usss', 'patron', 'copatron','wlrecrutement', 'wlbot'].includes(i.customId);
    const collector = interaction.message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async action => {
        if (action.customId === 'recruit') {
            const governmentRole = guild.roles.cache.get(config.roles.gouvernement);
            if (governmentRole) await targetUser.roles.add(governmentRole);
            await action.reply({ content: `**:gear: Accès:** ${targetUser.user.tag} à été recruté ✅.`, ephemeral: false });
            await interaction.message.delete();
            
        } else if (action.customId === 'fire') {
            const rolesToRemove = targetUser.roles.cache.filter(role => role.id !== config.roles.citoyen);
            await targetUser.roles.remove(rolesToRemove);
            await action.reply({ content: `**:gear: Accès:** ${targetUser.user.tag} a été viré ✅.`, ephemeral: false });
            await interaction.message.delete();
        } else if (['lspd', 'ems', 'bcso', 'bcms', 'usss'].includes(action.customId)) {
            const rolesToAdd = config.roles[action.customId].roles.map(roleId => guild.roles.cache.get(roleId));
            for (const role of rolesToAdd) {
                if (role) await targetUser.roles.add(role);
            }

            // Proposer l'ajout de l'État-Major uniquement si le rôle d'État-Major existe pour ce département
            if (config.roles[action.customId].etat_major) {
                const etatMajorButtonYes = new ButtonBuilder()
                    .setCustomId(`etat_major_${action.customId}_yes`)
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Success);

                const etatMajorButtonNo = new ButtonBuilder()
                    .setCustomId(`etat_major_${action.customId}_no`)
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger);

                const etatMajorRow = new ActionRowBuilder().addComponents(etatMajorButtonYes, etatMajorButtonNo);

                await action.update({ content: `Ajouter l'État-Major pour ${action.customId.toUpperCase()} ?`, components: [etatMajorRow] });

                const etatMajorCollector = action.message.createMessageComponentCollector({ time: 30000, max: 1 });

                etatMajorCollector.on('collect', async etatMajorAction => {
                    const confirmationContent = etatMajorAction.customId === `etat_major_${action.customId}_yes`
                        ? `**:gear: Accès:** ${action.customId.toUpperCase()} + EM ajoutés ✅ à  ${targetUser.user.tag}.`
                        : `**:gear: Accès:** ${action.customId.toUpperCase()} ajoutés ✅ à ${targetUser.user.tag}.`;

                    if (etatMajorAction.customId === `etat_major_${action.customId}_yes`) {
                        const etatMajorRole = guild.roles.cache.get(config.roles[action.customId].etat_major);
                        if (etatMajorRole) await targetUser.roles.add(etatMajorRole);
                    }

                    const confirmationEmbed = new EmbedBuilder()
                        .setTitle('Confirmation des accès')
                        .setDescription(`Accès ajoutés pour ${targetUser.user.tag}`)
                        .addFields(
                            { name: 'Accès', value: `${action.customId.toUpperCase()} : ✅`, inline: true },
                            { name: 'État-Major', value: etatMajorAction.customId === `etat_major_${action.customId}_yes` ? '✅' : '❌', inline: true }
                        )
                        .setColor('#4cc932');

                    await etatMajorAction.update({
                        content: confirmationContent,
                        embeds: [confirmationEmbed],
                        components: [] // Désactiver les boutons
                    });
                });
            } else {
                await action.reply({ content: `**:gear: Accès:** ${action.customId.toUpperCase()} ajoutés ✅.`, ephemeral: false });
            }
        } else if (['wlrecrutement', 'wlbot', 'copatron', 'patron'].includes(action.customId)) {
            // Gestion des rôles uniques
            const roleToAdd = guild.roles.cache.get(config.roles[action.customId]);
            if (roleToAdd) await targetUser.roles.add(roleToAdd);

            await action.reply({ content: `**:gear: Accès:**  ${action.customId.toUpperCase()} ajoutés ✅.`, ephemeral: false });
            await interaction.message.delete();
        }
    });
}
