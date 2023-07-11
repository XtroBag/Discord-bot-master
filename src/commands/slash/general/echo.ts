import { ApplicationCommandType, MessageContextMenuCommandInteraction, hyperlink } from 'discord.js';
import { SlashClass } from '../../../structures/slash.js';

export default new SlashClass({
    data: {
        name: 'echo',
        type: ApplicationCommandType.Message,
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Context',
        cooldown: 5,
        guildOnly: false,
    },
    execute: async (_client, interaction: MessageContextMenuCommandInteraction<'cached'>) => {

        // RE-VAMP THIS COMMAND TO BE BETTER AND NOT TAKE IN MENTIONS LIKE @EVERYONE AND MORE STUFF
        const message = await interaction.targetMessage.fetch();
        if (!message?.content) return interaction.reply({
            content: hyperlink('No content was found in this message!', message.url),
            ephemeral: true
        })
        else return interaction.reply({
            content: hyperlink(message.content, message.url)
        });
    }
});
