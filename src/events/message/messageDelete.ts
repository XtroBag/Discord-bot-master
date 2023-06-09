import { EventClass } from "../../structures/event.js";
import { messageCache } from "../../functions/messageCache.js";
import "dotenv/config";


export default new EventClass({
  name: "messageDelete",
  once: false,
  // @ts-ignore
  async execute(client, message) {
    if (message.author.bot) return;

  const messagesCache = [...messageCache].find(({ userMessageId }) => userMessageId === message.id);

  if (messagesCache) {
    const clientMessage = await message.channel.messages.fetch(messagesCache.replyMessageId).catch(() => null);

    clientMessage?.delete().catch(() => null)
  }

  },
});
