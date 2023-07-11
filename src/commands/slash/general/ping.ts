import { ApplicationCommandType, ChatInputCommandInteraction, inlineCode } from 'discord.js';
import { SlashClass } from '../../../structures/slash.js';

export default new SlashClass({
    data: {
        name: 'ping',
        description: 'Pong! Test the bots ping',
        type: ApplicationCommandType.ChatInput,
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 5,
        ownerOnly: false,
        guildOnly: false,
    },
    execute: async (_client, interaction: ChatInputCommandInteraction<'cached'>) => {

        const msg = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        }); 
        setTimeout(() => {
            const ping = msg.createdTimestamp - interaction.createdTimestamp;
            interaction.editReply({
                content: `Pong! Latency is ${inlineCode(`${ping}ms`)}. \nAPI Latency is ${inlineCode(`${interaction.client.ws.ping}ms`)}`
            });
        }, 3000);
    },
})