import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    TextChannel,
} from "discord.js";
import { SlashClass } from "../../../structures/slash.js";

export default new SlashClass({
    data: {
        name: "purge",
        description: "purge messages from chat or a user",
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: 'amount',
                description: 'amount of messages to delete',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                max_value: 100,
                min_value: 1, 
            },
        ],
    },
    opt: {
        userPermissions: ["ManageMessages"],
        botPermissions: ["ManageMessages"],
        category: "slash",
        cooldown: 3,
        guildOnly: false,
    },
    execute: async (_client, interaction: ChatInputCommandInteraction<'cached'>) => {
        const user = interaction.options.getMember("user");
        const amount = interaction.options.getInteger("amount");

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
		await (interaction.channel as TextChannel).bulkDelete(messages.filter(msg => user ? msg.author.id === user.id : true).toJSON().slice(0, amount), true);

    },
});
