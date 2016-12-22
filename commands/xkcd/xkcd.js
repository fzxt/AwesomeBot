const google = require("google");
const request = require("request");
const cheerio = require("cheerio");
let timeLimit = 60;
let config;
let lastMessageTime = 0;

module.exports = {
  usage: 'xkcd <keywords> - finds a xkcd comic with relevant keywords',
  run: (bot, message, cmdArgs) => {
    let xkcdLink = false;

    if ((Math.floor(Date.now() / 1000) - lastMessageTime) >= timeLimit) {
      google(`${cmdArgs} xkcd`, (err, res) => {
        for(let i = 0; i < res.links.length; i++){
          if(res.links[i].link.includes("//xkcd.com")){
            xkcdLink = res.links[i].link;
            break;
          }
        }
        // we are done with finding a link
        if (!xkcdLink){
          // link is either empty (this should NOT happen) or we don't have a link
          message.channel.sendMessage(`I'm sorry ${message.author}, i couldn't find a xkcd.`);
        } else {
          request(xkcdLink, (error, response, body) => {
            if (!error && response.statusCode === 200) {
              let htmlBody = cheerio.load(body);

              if (htmlBody('#comic').children().get(0).tagName === 'img') {
                let xkcdImg = `https:${htmlBody('#comic').children().first().attr('src')}`;
                message.channel.sendMessage(xkcdImg);
              } else {
                message.channel.sendMessage(`I'm sorry ${message.author}, i couldn't find a xkcd.`);
              }
            }
          });
        }
      });
    }
  },
  init: (bot) => {
    config = bot.settings.xkcd;
    timeLimit = config.timeLimit || timeLimit;
  },
};