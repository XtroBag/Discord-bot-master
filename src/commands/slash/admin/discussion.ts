import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { SlashClass } from "../../../structures/slash.js";
import { Colors, Emojis } from "../../../../config.js";

export default new SlashClass({
  data: {
    name: "discussion",
    description: "Setup a channel to talk too the bot",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "choice",
        description: "select a choice to perform",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Set", value: "Set" },
          { name: "Update", value: "Update" },
          { name: "Delete", value: "Delete" },
        ],
      },
    ],
  },
  opt: {
    userPermissions: ["Administrator"],
    botPermissions: ["SendMessages", "ManageChannels"],
    category: "slash",
    cooldown: 5,
    guildOnly: true,
  },
  execute: async (_client, interaction: ChatInputCommandInteraction<'cached'>) => {
    const choice = interaction.options.getString("choice");

    switch (choice) {
      case "Set":
        const embed = new EmbedBuilder()
          .addFields([
            {
              name: `> ${Emojis.Information} Discussion System`,
              value: `**Details:**
        ${Emojis.Blank} Message: Please select a channel to use for chatting!
        `,
            },
          ])
          .setColor(Colors.Information);

        const menu =
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents([
            new ChannelSelectMenuBuilder()
              .setCustomId("chatbotchannel")
              .setPlaceholder("Please select a channel")
              .setChannelTypes([ChannelType.GuildText])
              .setMinValues(1)
              .setMaxValues(1),
          ]);

        interaction.reply({ embeds: [embed], components: [menu] });

        break;

      case "Update":
        break;

      case "Delete":
        break;

      default:
        return;
    }
  },
});
