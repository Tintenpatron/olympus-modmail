const config = require('../../config.json');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const client = message.client;
        if(message.author.bot) return;

        const guild = client.guilds.cache.get(config.guildId);
        const parent = guild.channels.cache.get(config.parentId);
        if(!guild) return;
        if(!parent) return;


        if(message.channel.type === 'DM'){
            const mmChannel = guild.channels.cache.find(channel => channel.topic === message.author.id);
            if(mmChannel){
                if(mmChannel.parentId !== config.parentId) return;
                if(mmChannel.topic !== message.author.id) return;
                let embed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setTitle('Modmail von ' + message.author.username)
                    .setDescription(message.content)
                    .setColor("#513ec9")
                    .setFooter('Modmail von ' + message.author.tag + ' | ' + message.author.id)
                mmChannel.send({embeds:[embed]})
                    .then(async () => {
                        await message.react(config.successEmojiId);
                    })
                    .catch(async (error) => {
                        await message.react(config.errorEmojiId);
                    })
            }else{
                let channel = await guild.channels.create('mm-'+message.author.username.split(' ')[0].substring(0, 15), {
                    type: 'GUILD_TEXT',
                    topic: message.author.id,
                    parent: parent.id,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                        }
                    ]
                });
                for(let roleId of config.permittedRoles){
                    await channel.permissionOverwrites.create(roleId, {
                        VIEW_CHANNEL: true,
                        SEND_MESSAGES: true,
                        READ_MESSAGE_HISTORY: true,
                        ATTACH_FILES: true,
                        EMBED_LINKS: true,
                        ADD_REACTIONS: true,
                        USE_EXTERNAL_EMOJIS: true
                    });
                }
                let embed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setTitle('Modmail von ' + message.author.username)
                    .setDescription(message.content + '\n\n' +
                        '> Hinweis: ??ber die Buttons kannst du im Gespr??ch vorgefertigte Nachrichten senden!\n\n' +
                        '> - **blaue Antworten** passen eher an den **Beginn des Gespr??chs**\n' +
                        '> - **graue Antworten** passen eher in die **Mitte des Gespr??chs**\n' +
                        '> - **gr??ne Antworten** passen besser ans **Ende des Gespr??chs**\n' +
                        '> - **rote Buttons** sind **keine Antworten**, sondern schlie??en die Modmail')
                    .setColor("#513ec9")
                    .setFooter('Modmail von ' + message.author.tag + ' | ' + message.author.id)

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('mm_answers_greeting')
                            .setLabel('Begr????en')
                            .setEmoji('????')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('mm_answers_topic')
                            .setLabel('Nach Anliegen fragen')
                            .setEmoji('???')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('mm_answers_one_moment')
                            .setLabel('Ich bin gleich wieder da')
                            .setStyle('SECONDARY')
                            .setEmoji('????'),
                        new MessageButton()
                            .setCustomId('mm_answers_look')
                            .setLabel('Ich schaue mir das an')
                            .setStyle('SECONDARY')
                            .setEmoji('???????'),
                    );
                const row2 = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('mm_answers_more_infos')
                            .setLabel('Nach mehr Infos fragen')
                            .setStyle('SECONDARY')
                            .setEmoji('???'),
                        new MessageButton()
                            .setCustomId('mm_answers_thats_it')
                            .setLabel('Wir sind fertig')
                            .setStyle('SUCCESS')
                            .setEmoji('????'),
                        new MessageButton()
                            .setCustomId('mm_answers_further_questions')
                            .setLabel('Nach weiteren Fragen fragen')
                            .setStyle('SUCCESS')
                            .setEmoji('???'),
                        new MessageButton()
                            .setCustomId('mm_answers_close')
                            .setLabel('Verabschieden')
                            .setStyle('SUCCESS')
                            .setEmoji('????'),
                        new MessageButton()
                            .setCustomId('mm_close')
                            .setLabel('Modmail schlie??en')
                            .setStyle('DANGER')
                            .setEmoji('???')
                    )

                await channel.send({content: '@everyone', embeds: [embed], components: [row, row2]});

                let confirmation = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setTitle('Modmail erstellt')
                    .setDescription('Du hast erfolgreich eine Modmail erstellt! Wir werden uns so schnell wie m??glich mit dir in Verbindung setzen!')
                    .setColor("#513ec9")
                    .setFooter('Modmail von ' + message.author.tag + ' | ' + message.author.id);
                message.reply({embeds:[confirmation]});

            }


        }else{
            if(message.channel.parentId !== config.parentId) return;
            let userId = message.channel.topic;
            let user = await client.users.fetch(userId);

            let embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL())
                .setTitle('Modmail von ' + user.username)
                .setDescription(message.content)
                .setColor("#513ec9")
                .setFooter('Modmail von ' + user.tag + ' | ' + user.id)
            user.send({embeds:[embed]})
                .then(async () => {
                    await message.react(config.successEmojiId);
                })
                .catch(async (error) => {
                    await message.react(config.errorEmojiId);
                })
        }


    }
}
