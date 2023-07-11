import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  UserFlagsString,
} from "discord.js";
import { SlashClass } from "../../../structures/slash.js";
import { BadgeEmojis, BadgeStrings, Colors } from "../../../../config.js";
import { UsernameBadge } from "../../../functions/grabBadges.js";

export default new SlashClass({
  data: {
    name: "badges",
    type: ApplicationCommandType.ChatInput,
    description: "check Badges inside a server",
    options: [
      {
        name: "check",
        type: ApplicationCommandOptionType.String,
        description: "See the users that have a certain badge",
        choices: [
          { name: BadgeStrings.ActiveDeveloper, value: "ActiveDeveloper" },
          { name: BadgeStrings.BugHunter1, value: "BugHunterLevel1" },
          { name: BadgeStrings.BugHunter2, value: "BugHunterLevel2" },
          { name: BadgeStrings.EarlySupporter, value: "PremiumEarlySupporter" },
          { name: BadgeStrings.HypeSquadEvents, value: "Hypesquad" },
          {
            name: BadgeStrings.ModeratorProgramsAlumni,
            value: "CertifiedModerator",
          },
          { name: BadgeStrings.PartneredServer, value: "Partner" },
          { name: BadgeStrings.Staff, value: "Staff" },
          { name: BadgeStrings.VerifiedDeveloper, value: "VerifiedDeveloper" },
        ],
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
  execute: async (client, interaction: ChatInputCommandInteraction<"cached">) => {
    const badge = interaction.options.getString("check");

    if (badge) {
      let members = [];

      interaction.guild.members.cache.forEach(async (member) => {
        if (member.user.flags.toArray().includes(badge as UserFlagsString))
          members.push(member);
      });

      if (members.length === 0) members.push("None");

      const embed = new EmbedBuilder()
        .setTitle("Badge check")
        .setDescription(`People with the **${badge}** badge in this server`)
        .setFields([
          {
            name: "Badges",
            value: members.join("\n> "),
          },
        ])
        .setColor(Colors.Normal);

      try {
        await interaction.reply({ embeds: [embed] });
        console.log(members);
      } catch (e) {
        return await interaction.reply({
          content: `Too many people with the **${badge}** to show`,
        });
      }
    } else {
      let badges = [];
      let counts = {};

      for (const member of interaction.guild.members.cache.values()) {
        const user = await client.users.fetch(member.user.id);
        badges = badges.concat(user.flags?.toArray());

        UsernameBadge(user, badges);
      }

      for (const badge of badges) {
        if (counts[badge]) {
          counts[badge]++;
        } else {
          counts[badge] = 1;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle("Badges Count")
        .setDescription(
          `
         ${BadgeEmojis.ActiveDeveloper} **${
            counts[BadgeStrings.ActiveDeveloper] || 0
          }**
         ${BadgeEmojis.BugHunter1} **${
            counts[BadgeStrings.BugHunter1] || 0
          }**
         ${BadgeEmojis.BugHunter2} **${
            counts[BadgeStrings.BugHunter2] || 0
          }**
         ${BadgeEmojis.EarlySupporter} **${
            counts[BadgeStrings.EarlySupporter] || 0
          }**
         ${BadgeEmojis.HypeSquadBalance} **${
            counts[BadgeStrings.HypeSquadBalance] || 0
          }**
         ${BadgeEmojis.HypeSquadBravery} **${
            counts[BadgeStrings.HypeSquadBravery] || 0
          }**
         ${BadgeEmojis.HypeSquadBrilliance} **${
            counts[BadgeStrings.HypeSquadBrilliance] || 0
          }**
         ${BadgeEmojis.HypeSquadEvents} **${
            counts[BadgeStrings.HypeSquadEvents] || 0
          }**
         ${BadgeEmojis.ModeratorProgramsAlumni} **${
            counts[BadgeStrings.ModeratorProgramsAlumni] || 0
          }**
         ${BadgeEmojis.PartneredServer} **${
            counts[BadgeStrings.PartneredServer] || 0
          }**
         ${BadgeEmojis.Staff} **${
          counts[BadgeStrings.Staff] || 0
          }**
         ${BadgeEmojis.VerifiedDeveloper} **${
            counts[BadgeStrings.VerifiedDeveloper] || 0
          }**
         ${BadgeEmojis.Username} **${
          counts[BadgeStrings.Username] || 0
          }**

        `
        )
        .setColor(Colors.Normal)
        .setFooter({ text: `all badges for ${interaction.guild.name}` });

     return await interaction.reply({ embeds: [embed] });
    }
  },
});
