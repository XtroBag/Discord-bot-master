import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SlashClass } from '../../../structures/slash.js';
import { Colors } from '../../../../config.js';
import { ValorantMapResponse } from '../../../typings/valotypes.js';

export default new SlashClass({
    data: {
        name: 'valorant',
        description: 'get valorant maps',
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: 'map',
            description: 'the name of the map',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        }]
    },
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'general',
        cooldown: 5,
        guildOnly: false,
    },
    auto: async (int) => {

        const data = await fetch('https://valorant-api.com/v1/maps')
        const response = await data.json()

        const choices = response.data;

        await int.respond(choices.map((choice) => ({ name: choice.displayName, value: choice.uuid })))



    },
    execute: async (_client, int: ChatInputCommandInteraction<'cached'>) => {

        const uuid = int.options.getString('map')

        const mapCall = await fetch(`https://valorant-api.com/v1/maps/${uuid}`)
        const response = await mapCall.json();

        const map: ValorantMapResponse = response.data;

        const embed = new EmbedBuilder()
            .setTitle(`${map.displayName} Map`)
            .setThumbnail(map.displayIcon)
            .setImage(map.splash)
            .addFields([
                { name: 'Coordinates:', value: `${map.coordinates ?? 'N/A'}` },
                { name: 'Callouts:', value: `${map.callouts.map((call) => `[${call.superRegionName}] ${call.regionName}`).join(', ')}` }
            ])
            .setColor(Colors.Normal)

        int.reply({ embeds: [embed] })


    }
});
