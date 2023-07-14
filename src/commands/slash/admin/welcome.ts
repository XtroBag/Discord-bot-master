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
    const info = await Guild.findOne({ id: interaction.guildId });

    if (info.welcome.state === false) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Enable")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("Enable-Button"),
        new ButtonBuilder()
          .setLabel("Start")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("Start-Button")
          .setDisabled(true)
      );

      const enableReply = await interaction.reply({ components: [row] });

      const collector = enableReply.createMessageComponentCollector({
        filter: ({ user }) => user.id === interaction.user.id,
        dispose: true,
      });

      collector.on("ignore", (interaction) => {
        interaction.reply({
          content: `This interaction is not for you ${interaction.user.username}`,
        });
      });

      collector.on("collect", async (collected) => {
        if (collected.customId === "Enable-Button") {
          await Guild.findOneAndUpdate(
            {
              id: interaction.guild.id,
            },
            {
              $set: {
                "welcome.state": true,
              },
            }
          );

          info.welcome.state = true;

          row.components[0]
            .setStyle(ButtonStyle.Success)
            .setLabel("Enabled")
            .setDisabled(true);

          row.components[1].setDisabled(false);

          await collected.update({ components: [row] });
        }

        if (collected.customId === "Start-Button") {
          const channeSelectMenuRow =
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
              new ChannelSelectMenuBuilder()
                .setChannelTypes([ChannelType.GuildText])
                .setPlaceholder("Choose a welcome channel")
                .setMaxValues(1)
                .setMinValues(0)
                .setCustomId("Channel-Select")
            );

          const channelSelectMenu = await collected.update({
            components: [channeSelectMenuRow],
          });

          const channelSelectMenuResponse =
            await channelSelectMenu.awaitMessageComponent({
              componentType: ComponentType.ChannelSelect,
              filter: ({ user }) => user.id === interaction.user.id,
            });

          if (channelSelectMenuResponse.customId === "Channel-Select") {
            await Guild.findOneAndUpdate(
              {
                id: interaction.guild.id,
              },
              {
                $set: {
                  "welcome.channel": channelSelectMenuResponse.values[0],
                },
              }
            );
          }

          // CHANNEL SELECT MENU COMPLETE HERE ---------------------------

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

          const modalButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Continue")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("Start-Modal")
            );

          const modal = new ModalBuilder()
            .setCustomId("Prompt-Modal")
            .setTitle("Welcome Prompt");

          const modalMessage = new TextInputBuilder()
            .setCustomId("Welcome-Message")
            .setLabel("What is ur welcome msg?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const modalComponent =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
              modalMessage
            );

          modal.addComponents(modalComponent);

          const buttonResponse = await channelSelectMenuResponse.update({
            components: [modalButton],
            embeds: [embed],
          });

          const modalBeginButton = await buttonResponse.awaitMessageComponent({
            componentType: ComponentType.Button,
            filter: ({ user }) => user.id === interaction.user.id,
          });

          if (modalBeginButton.customId === "Start-Modal") {
            await modalBeginButton.showModal(modal);
          }

          const receivedModal = await modalBeginButton.awaitModalSubmit({
            time: 120000,
            filter: ({ user }) => user.id === interaction.user.id,
          });

          if (receivedModal.customId === "Prompt-Modal") {
            const msg =
              receivedModal.fields.getTextInputValue("Welcome-Message");

            await Guild.findOneAndUpdate(
              {
                id: interaction.guild.id,
              },
              {
                $set: {
                  "welcome.prompt": msg,
                },
              }
            ).then(async () => {
              await receivedModal.reply({
                content: "Message was submitted!",
                ephemeral: true,
              });
            });
          }

          // MESSAGE MODAL COMPLETE HERE ---------------------------

          const roleEmbed = new EmbedBuilder()
            .setTitle("Select On Join Roles")
            .setDescription("roles to give user when they join the server")
            .setColor(Colors.Normal);

          const skipButton = new ButtonBuilder()
            .setLabel("Skip")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("Skip-Button");

          const roleSkipButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(skipButton);

          const roleSelectMenu =
            new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
              new RoleSelectMenuBuilder()
                .setCustomId("Role-Select")
                .setPlaceholder("Select some roles to give a new user")
                .setMaxValues(4)
                .setMinValues(0)
            );

          const roleMenuComponents = await modalBeginButton.editReply({
            components: [roleSelectMenu, roleSkipButton],
            embeds: [roleEmbed],
          });

          const nextcollector =
            roleMenuComponents.createMessageComponentCollector({
              filter: ({ user }) => user.id === interaction.user.id,
            });

          nextcollector.on("ignore", (interaction) => {
            interaction.reply({
              content: `This interaction is not for you ${interaction.user.username}`,
            });
          });

          nextcollector.on("collect", async (component) => {
            if (component.isRoleSelectMenu()) {
              if (component.customId === "Role-Select") {
                const welsystem = await Guild.findOneAndUpdate(
                  {
                    id: interaction.guildId,
                  },
                  {
                    $set: {
                      "welcome.roleIds": component.values,
                    },
                  },
                  { new: true }
                );

                const embed = new EmbedBuilder()
                  .setTitle("Completed Setup")
                  .setDescription(
                    "The system will now welcome and give new users roles on join"
                  )
                  .addFields([
                    {
                      name: "Selected Roles:",
                      value: `${welsystem.welcome.roleIds
                        .map((id, idx) => {
                          return `\n${idx + 1} <@&${id}>`;
                        })
                        .join(" ")}`,
                    },
                    {
                      name: "Selected Channel:",
                      value: `<#${welsystem.welcome.channel}>`,
                    },
                    {
                      name: "Prompt:",
                      value: `${welsystem.welcome.prompt}`,
                    },
                  ])
                  .setFooter({ text: "Completed Setup" })
                  .setTimestamp()
                  .setColor(Colors.Normal);

                await component.update({
                  embeds: [embed],
                  components: [],
                });
              }
            }

            if (component.isButton()) {
              if (component.customId === "Skip-Button") {
                const embed = new EmbedBuilder()
                  .setTitle("Finished Setup")
                  .setDescription(
                    "The system will now welcome new users who join the server"
                  )
                  .setFooter({ text: "Skipped role selection" })
                  .setTimestamp()
                  .setColor(Colors.Normal);

                roleMenuComponents.edit({
                  embeds: [embed],
                  components: [],
                });
              }
            }
          });
        }
      });
    } else if (info.welcome.state === true) {
      // MAKE IT WHEN THE PERSON DISABLED THE SYSTEM PUTS BACK TO DEFAULT VALUES
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Disable")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("Disable-Button")
      );

      const disableReply = await interaction.reply({ components: [row] });

      const collector = disableReply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: ({ user }) => user.id === interaction.user.id,
      });

      collector.on("ignore", (interaction) => {
        interaction.reply({
          content: `This interaction is not for you ${interaction.user.username}`,
        });
      });

      collector.on("collect", async (button) => {
        if (button.customId === "Disable-Button") {
          await Guild.findOneAndUpdate(
            {
              id: interaction.guild.id,
            },
            {
              $set: {
                "welcome.state": false,
              },
            }
          );

          // make it here to when someone disables system everything goes to default
        }

        button.update({ content: "Disabled System", components: [] });
      });
    }
  },
});
