// make welcome channel system with database
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { SlashClass } from "../../../structures/slash.js";
import { Guild } from "../../../database/modals/guild.js";

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
  execute: async (_client, interaction: ChatInputCommandInteraction<"cached">) => {
    const info = await Guild.findOne({
      guildName: interaction.guild.name,
      id: interaction.guildId,
    });
    if (!info) return;

    if (!info.welcome.state) {
      // make it show enable components
      // make it so this call makes it enables the system in database

      const embed = new EmbedBuilder()
      .setTitle('')

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Enable")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("Mode-Button")
      );

      const response = await interaction.reply({ components: [row] });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (button) => {
        if (button.member.id !== interaction.member.id) {
          interaction.reply({ content: "these buttons are not for you" });
        } else {
          if (button.customId === "Mode-Button") {
            await Guild.findOneAndUpdate(
              { id: interaction.guild.id },
              { $set: { 'welcome.state': true } }
            )

            row.components[0].setStyle(ButtonStyle.Success).setLabel('Enabled')

            await button.update({ components: [row]})

            console.log("updated value");
          }
        }
      });
    } else {
      // make it show disable componets
      // make it so this call makes it disables the system in database
      console.log('value is set to true currently')
    }
  },
});
