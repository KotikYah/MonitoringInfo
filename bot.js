const Discord = require('discord.js');
require('discord-reply');
const client = new Discord.Client();
const inf = require('./config.json');
const request = require('request')
const cheerio = require('cheerio')
const util = require('minecraft-server-util');
const jsdom = require('jsdom');
const { response } = require('express');
var http = require('http');
var url = require('url');
const fs = require('fs');

let prefix = 'mi/';
let servers = [];

client.on('ready', () => {
    try {
    http.createServer(function (req, res) {
        var hostname = req.headers.host;
        var pathname = url.parse(req.url).pathname;
        console.log('http://' + hostname + pathname);
      
        res.writeHead(200);
        res.end();
      }).listen(80);
    } catch (err) {
        console.log("Cannot start http server on port 80: " + err);
    }
    console.log(`I am ${client.user.tag}`);
    client.user.setPresence({
        status: 'online',
        activity: {
            type: 'WATCHING',
            name: `${prefix}help | ${inf['version']}`
        },
    });
    updateServers();
    setInterval(updateServers, 5000);
    for (let a = 0; a < inf['listen_new_servers'].length; a++) {
        let b = inf['listen_new_servers'][a].split("-");
        guildId = parseInt(b[0]);
        channelId = parseInt(b[1]);
        client.guilds.cache.filter(guild => guild.id == guildId).forEach((guild) => {
            guild.channels.cache.filter(chx => chx.type === "text" && chx.id == channelId).forEach(channel => channel.send("Bot started up."))
        });
    };
});

client.on("message", async msg => {
    if (msg.author.bot) return;
    if (msg.guild == null) return;

    let args = msg.content.toString().split(' ');
    let lowermsg = msg.content.toString().toLocaleLowerCase();

    if (!lowermsg.startsWith(prefix)) return;

    if (args[0].toLowerCase() === `${prefix}help`) {
        if (args.length == 1) {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Помощь`)
                .addField(`${prefix}help check`, `Узнать подробнее о сервере.`, false)
                .addField(`${prefix}help monitoring`, `Проверить сервера на мониторинге.`, false)
                .setFooter(`Запросил ${msg.author.tag} | ${inf['version']}`);
            return msg.lineReplyNoMention(embed);
        } else if (args[1].toLowerCase() === "check") {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Помощь | check`)
                .addField(`Как использовать`, `${prefix}check **<айпи>**:**<порт>**`, true)
                .addField(`Пример`, `${prefix}check **127.0.0.1**:**25565**`, true)
                .setFooter(`Запросил ${msg.author.tag} | ${inf['version']}`);
            return msg.lineReplyNoMention(embed);
        } else if (args[1].toLowerCase() === "monitoring") {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Помощь | monitoring`)
                .addField(`Как использовать`, `${prefix}monitoring`, true)
                .addField(`Пример`, `${prefix}monitoring`, true)
                .setFooter(`Запросил ${msg.author.tag} | ${inf['version']}`);
            return msg.lineReplyNoMention(embed);
        }
    }

    if (args[0].toLowerCase() === `${prefix}check`) {
        if (args.length != 2) {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Помощь | check`)
                .addField(`Как использовать`, `${prefix}check **<айпи>**:**<порт>**`, true)
                .addField(`Пример`, `${prefix}check **127.0.0.1**:**25565**`, true)
                .setFooter(`Запросил ${msg.author.tag} | ${inf['version']}`);
            return msg.lineReplyNoMention(embed);
        }
        let ip;
        let port;
        if (!args[1].includes(":")) {
            ip = args[1];
            port = "25565";
        } else {
            let a = args[1].split(":");
            ip = a[0];
            port = a[1];
        }
        return s(msg, ip, port);
    }

    if (args[0].toLowerCase() === `${prefix}monitoring`) {
        let s = [];
        jsdom.JSDOM.fromURL("https://monitoringminecraft.ru/novie-servera-1.12.2", {})
            .then(function (dom) {
                dom.window.document.querySelectorAll('.ip_serv').forEach(element => {
                    x = element.innerHTML.toString().split(':');
                    ip = x[0];
                    port = x[1];
                    util.status(ip, { port: parseInt(port) })
                        .then((response) => {
                            const embed = new Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(`Статус сервера: онлайн`)
                                .addField('Айпи', `**${ip}:${port}**`, false)
                                .addField('Версия', `**${response['version']}**`, false)
                                .addField('Онлайн', `**${response['onlinePlayers']}/${response['maxPlayers']}**`, false)
                                .addField('Мотд', `**${response['description']}**`, false)
                                .addField('Полезные ссылки:', `**[Check-Host](https://check-host.net/check-tcp?host=${ip}:${port})\n[McSrvStat](https://mcsrvstat.us/server/${ip}:${port})**`, true)
                                .setFooter(`Запросил ${msg.author.tag} | ${inf['version']}`);
                            msg.lineReplyNoMention(embed);;
                        })
                        .catch((error) => {
                            return;
                        });
                });
            });
    }
})

function s(msg, ip, port) {
    util.status(ip, { port: parseInt(port) })
        .then((response) => {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Статус сервера: онлайн`)
                .addField('Айпи', `**${ip}:${port}**`, false)
                .addField('Версия', `**${response['version']}**`, false)
                .addField('Онлайн', `**${response['onlinePlayers']}/${response['maxPlayers']}**`, false)
                .addField('Мотд', `**${response['description']}**`, false)
                .addField('Полезные ссылки:', `**[Check-Host](https://check-host.net/check-tcp?host=${ip}:${port})\n[McSrvStat](https://mcsrvstat.us/server/${ip}:${port})**`, true)
                .setFooter(`Запросил ${msg.author.tag} | ${inf['version']}`);
            msg.lineReplyNoMention(embed);
        })
        .catch((error) => {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Статус сервера: оффлайн`)
                .addField('Айпи', `**${ip}:${port}**`, false)
                .setFooter(`Запросил ${msg.author.tag} | ${inf['version']}`);
            msg.lineReplyNoMention(embed);
        });
}

function updateServers() {
    let s = [];
    jsdom.JSDOM.fromURL("https://monitoringminecraft.ru/novie-servera-1.12.2", {})
        .then(function (dom) {
            dom.window.document.querySelectorAll('.ip_serv').forEach(element => {
                s.push(element.innerHTML.toString());
            });
       }).finally(function() {
        if (servers.length == 0) {
            servers = s;
            return;
        }
        s.forEach(server => {
            if (servers.includes(server)) return;
            console.log(`new server : ${server}`);
            servers.push(server);
            x = server.split(':');
            util.status(x[0], { port: parseInt(x[1]) })
            .then((response) => {
                    const embed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Новый сервер найден!`)
                        .addField('Айпи', `**${x[0]}:${x[1]}**`, false)
                        .addField('Версия', `**${response['version']}**`, false)
                        .addField('Онлайн', `**${response['onlinePlayers']}/${response['maxPlayers']}**`, false)
                        .addField('Мотд', `**${response['description']}**`, false)
                        .addField('Полезные ссылки:', `**[Check-Host](https://check-host.net/check-tcp?host=${x[0]}:${x[1]})\n[McSrvStat](https://mcsrvstat.us/server/${x[0]}:${x[1]})**`, true)
                    for (let a = 0; a < inf['listen_new_servers'].length; a++) {
                        let b = inf['listen_new_servers'][a].split("-");
                        guildId = parseInt(b[0]);
                        channelId = parseInt(b[1]);
                        client.guilds.cache.filter(guild => guild.id == guildId).forEach((guild) => {
                            guild.channels.cache.filter(chx => chx.type === "text" && chx.id == channelId).forEach(channel => channel.send(embed))
                        });
                    };
            })
            .catch((error) => {
                if (inf["errors"])
                    console.log(`new server check error: ${error}`);
                return;
            });
        });
    });
}

client.login(inf['token']);