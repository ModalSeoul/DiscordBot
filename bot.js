const Eris = require('eris');
const request = require('request');
const fs = require('fs');

const client = new Eris(process.env.DISCORD_TOKEN);
const Scrobble = 'https://wilt.fm/api/scrobbles/?active=';
let clientKeys = require('./users.json');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
});

client.on('messageCreate', msg => {
  if (msg.content.toLowerCase().startsWith('.wilt')) {
    let user = clientKeys[msg.author.id];
    if (user === undefined) {
      client.createMessage(msg.channel.id, 'Need to .setwilt <name> first :smug:');
    } else {
      request(Scrobble + user, (e, r, b) => {
        if (r.statusCode == 200) {
          let parsedResp = JSON.parse(b)[0];
          client.createMessage(msg.channel.id, `**${user}** is listening to **${parsedResp.song_name}** by ${parsedResp.artist_name}`);
          client.createMessage(msg.channel.id, `https://wilt.fm/profile/${user}`);
        } else {
          client.createMessage(msg.channel.id, `Backend responded with shit code of ${r.statusCode}`);
        }
      });
    }
  }

  if (msg.content.toLowerCase().startsWith('.setwilt')) {
    let uArg = msg.content.split(' ')[1];

    if (uArg in clientKeys) {
      client.createMessage(msg.channel.id, 'Fuck off you\'ve already been added');
    } else {
      clientKeys[msg.author.id] = uArg;
      fs.writeFile('users.json', JSON.stringify(clientKeys), e => {
        if (!e === null) {
          client.createMessage(msg.channel.id, e);
        } else {
          client.createMessage(msg.channel.id, 'Added');
        }
      });
    }
  }
});

client.connect();
