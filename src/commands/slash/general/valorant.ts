import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { SlashClass } from "../../../structures/slash.js";
import { Colors } from "../../../../config.js";
import { ValorantMapResponse } from "../../../typings/valorant.js";

export default new SlashClass({
  data: {
    name: "valorant",
    description: "get valorant maps",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "map",
        description: "the name of the map",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      },
    ],
  },
  opt: {
    userPermissions: ["SendMessages"],
    botPermissions: ["SendMessages"],
    category: "general",
    cooldown: 5,
    guildOnly: false,
  },
  auto: async (autocomplete) => {
    const value = autocomplete.options.getFocused()
    const data = await fetch("https://valorant-api.com/v1/maps");
    const response = await data.json();

    const choices = response.data;

    const filtered = choices.filter((choice: ValorantMapResponse) => {
      return choice.displayName.startsWith(value)
     })

    await autocomplete.respond(
      filtered.map((choice: ValorantMapResponse) => ({
        name: choice.displayName,
        value: choice.uuid,
      }))
    );
  },

  execute: async (_client, interaction: ChatInputCommandInteraction<"cached">) => {
    const uuid = interaction.options.getString("map");

    const mapCall = await fetch(`https://valorant-api.com/v1/maps/${uuid}`);
    const response = await mapCall.json();

    const map: ValorantMapResponse = response.data;

    const embed = new EmbedBuilder()
      .setTitle(`${map.displayName} Map`)
      .setThumbnail(map.displayIcon)
      .setImage(map.splash)
      .addFields([
        {
          name: "Coordinates:",
          value: `${map.coordinates ?? "None"}`,
        },
        {
          name: "Callouts:",
          value: `${map.callouts
            .map((callout, index) =>  {
              return `\`\`${callout.superRegionName} \`\` **${callout.regionName}**${(index + 1) % 2 === 0 ? "\n" : ""}`
            }
            )
            .join(" ")
            .split("\n")
            .join("\n")
          }`,
          inline: true
        },
      ])
      .setColor(Colors.Normal);

    interaction.reply({ embeds: [embed] });
  },
});
