import { messageCache } from "../../../functions/messageCache.js";
import { TextClass } from "../../../structures/text.js";

export default new TextClass({
    data: {
        name: 'ping',
        description: 'use the ping command',
        usage: 'ping',
        ownerOnly: false,
        category: 'general'
    },
   async run(_client, message, _args) {
      const reply = await message.reply({ content: 'Ping command works!'})

      messageCache.add({
        replyMessageId: reply.id,
        userMessageId: message.id
      })
    },
})