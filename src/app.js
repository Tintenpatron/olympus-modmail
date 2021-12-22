const Discord = require('discord.js');
const config = require('../config.json');
const fs = require('fs');

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: [
        'MESSAGE',
        'CHANNEL',
        'REACTION'
    ]
});


client.on('ready', async () => {
    console.log('Ready as ' + client.user.tag);
});

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for(let file of eventFiles){
    const event = require('./events/' + file);
    client.on(event.name, (...args) => event.execute(...args));
}
client.login(config.token);
