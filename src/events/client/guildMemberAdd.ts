import { EventClass } from "../../structures/event.js";
import { Guild } from "../../database/modals/guild.js";
import "dotenv/config";

export default new EventClass({
  name: "guildMemberAdd",
  once: false,
  async execute(_client, member) {
    console.log(member)

    const server = await Guild.findOne({ id: member.guild.id });

    const { welcome: data } = server;

    const channel = member.guild.channels.cache.get(data.channel)
    if (channel.isTextBased()) {
      await channel
        .send({
          content: `${data.prompt
            .replace("{member}", member.user.username)
            .replace("{mention}", `<@${member.user.id}>`)
            .replace("{server}", member.guild.name)
            .replace("{membercount}", `${member.guild.memberCount}`)}`,
        })
        .catch(() => {});
    }
  },
});
