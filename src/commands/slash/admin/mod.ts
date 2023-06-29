import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
    AutoModerationRuleEventType,
    AutoModerationRuleTriggerType,
    AutoModerationActionType,
    EmbedBuilder,
} from "discord.js";
import { SlashClass } from "../../../structures/slash.js";
import { Colors, Emojis } from "../../../../config.js";

export default new SlashClass({
    data: {
        name: "automod",
        description: 'use discords built in automoderation system',
        type: ApplicationCommandType.ChatInput,
        options: [{
            name: 'flagged-words',
            description: 'block swears, sexual content and more',
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: 'spam-messages',
            description: 'block messages that can be known as spam',
            type: ApplicationCommandOptionType.Subcommand
        }, {
            name: 'mention-spam',
            description: 'block messages that have alot of spam',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'number',
                    description: 'the number of mentions requested to block a message',
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        }, {
            name: 'keyword',
            description: 'block a certain message in the server',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'word',
                description: 'the word you want to block int he server',
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        }],
    },
    opt: {
        userPermissions: ['Administrator'],
        botPermissions: ['Administrator'],
        category: "admin",
        cooldown: 3,
        guildOnly: true,
    },
    execute: async (_client, int: ChatInputCommandInteraction<'cached'>) => {
        const sub = int.options.getSubcommand();

        switch (sub) {
            case 'flagged-words':
                const rules = await int.guild.autoModerationRules.fetch({ cache: true })

                if (rules.find((rule) => rule.triggerType === AutoModerationRuleTriggerType.KeywordPreset)) {
                    return await int.reply({ embeds: [new EmbedBuilder().setColor(Colors.Normal).setDescription(`${Emojis.Cross} This rule already exists`)] })
                }

                await int.guild.autoModerationRules.create({
                    name: 'block a given keyword in a msg',
                    triggerType: AutoModerationRuleTriggerType.KeywordPreset,
                    eventType: AutoModerationRuleEventType.MessageSend,
                    enabled: true,
                    triggerMetadata: {
                        presets: [1, 2, 3]
                    },
                    actions: [{
                        type: AutoModerationActionType.BlockMessage,
                        metadata: {
                            channel: int.channelId,
                            customMessage: `You're message included inappropriate content so please don't say that`,
                            durationSeconds: 10
                        }
                    }],

                }).catch(async () => {})

                const embed = new EmbedBuilder()
                    .setColor(Colors.Normal)
                    .setDescription(`${Emojis.Check} Automod rule has been created!`)

                await int.reply({ embeds: [embed] })

                break;
            case 'spam-messages':
                console.log(sub)
                break;
            case 'mention-spam':
                console.log(sub)
                break;
            case 'keyword':
                console.log(sub)
                break;
        }
    },
});
