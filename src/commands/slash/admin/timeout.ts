import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import ms from "ms";
import { SlashClass } from "../../../structures/slash.js";

export default new SlashClass({
  data: {
    name: "timeout",
    description: "Timeout a user inside this guild",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "user",
        description: "Timeout the user selected",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "time",
        description: "The time set for the timeout",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "reason",
        description: "The reason for this timeout",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  opt: {
    userPermissions: ["MuteMembers"],
    botPermissions: ["MuteMembers"],
    category: "slash",
    cooldown: 3,
    guildOnly: false,
  },
  execute: async (_client, interaction: ChatInputCommandInteraction<'cached'>) => {
    const user = interaction.options.getMember("user");
    const time = interaction.options.getString("time");
    const reason = interaction.options.getString("reason");

    if (!user.moderatable || !user.manageable) {
      return await interaction.reply({
        content: "This user can not be modified by the bot!",
      });
    }
  
    const length = ms(time);

    if (!length || length >  ms('28d')) {
      return await interaction.reply({ content: 'Time is invalid or is over 28 day limit'})
    } 

    await user.timeout(ms(time), reason).catch((err) => {
      return console.log(`An error has occured: ${err}`);
    });

    const embed = new EmbedBuilder()
    .setTitle('Timeout')
    .setDescription(`${user.user.username}'s been timed out until <t:${Math.round((Date.now() + length) / 1000)}:f>`)
    .setTimestamp()

   await interaction.reply({
      embeds: [embed]
    });
  },
});
