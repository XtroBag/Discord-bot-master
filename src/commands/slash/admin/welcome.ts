// make welcome channel system with database
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { SlashClass } from "../../../structures/slash.js";
import { Guild } from "../../../database/modals/guild.js";
import { Colors } from "../../../../config.js";

export default new SlashClass({
  data: {
    name: "welcome",
    description: "setup a welcome system for you're server",
    type: ApplicationCommandType.ChatInput,
  },
  opt: {
    userPermissions: ["Administrator"],
    botPermissions: ["Administrator"],
    category: "admin",
    cooldown: 3,
    guildOnly: false,
  },
  execute: async (
    _client,
    interaction: ChatInputCommandInteraction<"cached">
  ) => {
    const info = await Guild.findOne({
      id: interaction.guildId,
    });
    if (!info) return;

    if (!info.welcome.state) {
      // make it show enable components
      // make it so this call makes it enables the system in database

      const embed = new EmbedBuilder()
        .setTitle("Welcome system")
        .setDescription("Click the button below to activate the system")
        .setColor(Colors.Normal)
        .setFooter({ text: `Run by ${interaction.user.username}` });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Enable")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("Mode-Button"),
        new ButtonBuilder()
          .setLabel("Start")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("Start-Button")
          .setDisabled(true)
      );

      const response = await interaction.reply({
        components: [row],
        embeds: [embed],
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (button) => {
        if (button.member.id !== interaction.member.id) {
          await button.reply({
            content: "these buttons are not for you",
            ephemeral: true,
          });
        } else {
          if (button.customId === "Mode-Button") {
            await Guild.findOneAndUpdate(
              { id: interaction.guild.id },
              { $set: { "welcome.state": true } }
            );

            info.welcome.state = true;

            row.components[0]
              .setStyle(ButtonStyle.Success)
              .setLabel("Enabled")
              .setDisabled(true);

            const embed = new EmbedBuilder()
              .setTitle("Activated System")
              .setDescription("the system is now active")
              .setColor(Colors.Normal)
              .setFooter({ text: `Run by ${interaction.user.username}` });

            row.components[1].setDisabled(false);

            await button.update({
              components: [row],
              embeds: [embed],
            });
          }

          if (button.customId === "Start-Button") {
            if (info.welcome.state === false) {
              await button.reply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription('Please press the "Enable" button first')
                    .setColor(Colors.Normal),
                ],
                ephemeral: true,
              });
            } else {
              const row =
                new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                  new ChannelSelectMenuBuilder()
                    .setChannelTypes([ChannelType.GuildText])
                    .setPlaceholder("Choose a welcome channel")
                    .setMaxValues(1)
                    .setMinValues(0)
                    .setCustomId("Channel-Menu")
                );

              const channelResponse = await button.update({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      "Select a channel to use to welcome new users"
                    )
                    .setColor(Colors.Normal),
                ],
                components: [row],
              });

              const menuResponse = await channelResponse.awaitMessageComponent({
                componentType: ComponentType.ChannelSelect,
              });

              if (menuResponse.customId === "Channel-Menu") {
                await Guild.findOneAndUpdate(
                  { id: interaction.guild.id },
                  { $set: { "welcome.channel": menuResponse.values[0] } }
                );
              }

              const embed = new EmbedBuilder()
                .setTitle("Prepare prompt")
                .setDescription(
                  "You will be setting a prompt to show new users joining"
                )
                .addFields([
                  {
                    name: "Replacements:",
                    value: `
                  {member} - shows member name
                  {mention} - mentions the member
                  {server} - the server name
                  {membercount} - servers membercount
                  `,
                  },
                ])
                .setColor(Colors.Normal);

              const modalButtons =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder()
                    .setLabel("Continue")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("Start-Modal")
                );

              const modal = new ModalBuilder()
                .setCustomId("Prompt-Modal")
                .setTitle("Welcome Prompt");

              const welcomeMessage = new TextInputBuilder()
                .setCustomId("Welcome-Message")
                .setLabel("What is ur welcome msg?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

              const question =
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                  welcomeMessage
                );

              modal.addComponents(question);

              const buttonResponse = await menuResponse.update({
                components: [modalButtons],
                embeds: [embed],
              });

              const modalResponse = await buttonResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
              });
              if (modalResponse.customId === "Start-Modal") {
                modalResponse.showModal(modal);
              }

              const response = await modalResponse.awaitModalSubmit({
                time: 120000,
              });
              if (response.customId === "Prompt-Modal") {
                const msg =
                  response.fields.getTextInputValue("Welcome-Message");

                await Guild.findOneAndUpdate(
                  { id: interaction.guild.id },
                  { $set: { "welcome.prompt": msg } }
                ).then(async () => {
                  await response.reply({
                    content: "Message was submitted!",
                    ephemeral: true,
                  });
                });

                //  modalResponse.update()
                // send the "msg" to database
              }

              const roleEmbed = new EmbedBuilder()
                .setTitle("Select On Join Roles")
                .setDescription("roles to give user when they join the server");

              const roleSkipButton =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder()
                    .setLabel("Skip")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("Skip-Button")
                );

              const roleSelectMenu =
                new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
                  new RoleSelectMenuBuilder()
                    .setCustomId("Role-Select")
                    .setPlaceholder("Select some roles to give a new user")
                    .setMaxValues(7)
                    .setMinValues(0)
                );

              const roleMenuButton = await modalResponse.editReply({
                components: [roleSelectMenu, roleSkipButton],
                embeds: [roleEmbed],
              });

              const eitherButtonResponse =
                await roleMenuButton.awaitMessageComponent({
                  componentType: ComponentType.Button,
                });

              if (eitherButtonResponse.customId === "Skip-Button") {
                const finishedEmbed = new EmbedBuilder()
                  .setTitle("Setup Finished!")
                  .setDescription("the setup has been completed")
                  .setColor(Colors.Normal);

                eitherButtonResponse.update({
                  embeds: [finishedEmbed],
                  components: [],
                });
              }

              const menuRoleResponse =
                await roleMenuButton.awaitMessageComponent({
                  componentType: ComponentType.RoleSelect,
                });

                // CONTINUE HERE FIXING THIS SO IT TAKES THE ROLES AND PUTS THEM INTO ARRAY IN DATABASE
                // THEN CODE THE GUILD_MEMBER_JOIN EVENT TO SEND STUFF TOO CHANNEL 
                // ALL ADD CODE IN THAT EVENT THAT REPLACES PLACEHOLDERS FOR REAL THING
                // https://www.youtube.com/watch?v=LFxN84EY2FM

              if (menuRoleResponse.customId === "Role-Select") {
                await Guild.findOneAndUpdate(
                  { id: interaction.guild.id },
                  { $push: { "welcome.roleIds": menuRoleResponse.values[0] } }
                );

                console.log(menuRoleResponse.values[0])
              }
            }
          }
        }
      });
    } else {
      // MAKE IT WHEN THE PERSON DISABLED THE SYSTEM PUTS BACK TO DEFAULT VALUES

      const embed = new EmbedBuilder()
        .setTitle("Welcome system")
        .setDescription("Click the button below to deactivate the system")
        .setColor(Colors.Normal)
        .setFooter({ text: `Run by ${interaction.user.username}` });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Disable")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("Mode-Button")
      );

      const response = await interaction.reply({
        components: [row],
        embeds: [embed],
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (button) => {
        if (button.member.id !== interaction.member.id) {
          await button.reply({
            content: "these buttons are not for you",
            ephemeral: true,
          });
        } else {
          if (button.customId === "Mode-Button") {
            await Guild.findOneAndUpdate(
              { id: interaction.guild.id },
              { $set: { "welcome.state": false } }
            );

            row.components[0]
              .setStyle(ButtonStyle.Danger)
              .setLabel("Disabled")
              .setDisabled(true);

            const embed = new EmbedBuilder()
              .setTitle("Deactivated System")
              .setDescription("the system is now disabled")
              .setColor(Colors.Normal)
              .setFooter({ text: `Run by ${interaction.user.username}` });

            await button.update({ components: [row], embeds: [embed] });
          }
        }
      });
    }
  },
});
