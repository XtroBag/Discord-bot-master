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
                name: 'words',
                description: 'enter words in a order like: word, word, word',
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
        const words = int.options.getString('word');

        const rules = await int.guild.autoModerationRules.fetch({ cache: true })

        switch (sub) {
            case 'flagged-words':
                if (rules.find((rule) => rule.triggerType === AutoModerationRuleTriggerType.KeywordPreset) && rules.size > 1) {
                    return await int.reply({ embeds: [new EmbedBuilder().setColor(Colors.Normal).setDescription(`${Emojis.Cross} This rule already exists`)] })
                }

                await int.guild.autoModerationRules.create({
                    name: 'Blocks all types of bad message content',
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

                }).catch(async () => { })

                const embed = new EmbedBuilder()
                    .setColor(Colors.Normal)
                    .setDescription(`${Emojis.Check} Automod rule has been created!`)

                await int.reply({ embeds: [embed] })

                break;
            case 'keywords':







                if (rules.find((rule) => rule.triggerType === AutoModerationRuleTriggerType.Keyword) && rules.size > 6) {
                    return await int.reply({ embeds: [new EmbedBuilder().setColor(Colors.Normal).setDescription(`${Emojis.Cross} Cannot have more then 6 of this rule`)] })
                }

                // const str = words.toString()

                if (words.indexOf(',') > -1) {
                    const checkedWords = words.split(',');
                    console.log(checkedWords)

                    return checkedWords;
                }

                // function checkedWords() {
                //     words.indexOf(',') > -1
                //     const checkedWords = words.split(',');
                //     console.log(checkedWords)

                //     return checkedWords;
                // }


                await int.guild.autoModerationRules.create({
                    name: 'Blocks certain set words/phrases set by admins',
                    triggerType: AutoModerationRuleTriggerType.Keyword,
                    eventType: AutoModerationRuleEventType.MessageSend,
                    enabled: true,
                    triggerMetadata: {
                        keywordFilter: []
                    },
                    actions: [{
                        type: AutoModerationActionType.BlockMessage,
                        metadata: {
                            channel: int.channelId,
                            customMessage: 'You said something that is not allowed!',
                            durationSeconds: 10
                        }
                    }]
                })


                break;
            case 'mention-spam':
                console.log(sub)
                break;
            case 'spam-messages':
                console.log(sub)
                break;
        }
    },
});
