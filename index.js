"use strict";

const axios = require('axios');
const qs = require('qs');
const Msg = require("thelounge/src/models/msg");
const log = require("thelounge/src/log");
const Helper = require("thelounge/src/helper");
const Utils = require("thelounge/src/command-line/utils");
const fs = require("fs");
const path = require('path');

Helper.setHome(process.env.THELOUNGE_HOME || Utils.defaultHome()); // TODO shouldn't be necessary...
const configFile = path.resolve(Helper.getPackagesPath(), "giphy.json");

let config = {
    apiKey: "your-api-key",
    rating: "G",
};
let thelounge = null;

const red = '04';
const ratings = ['G', 'PG', 'PG-13', 'R'];

function saveConfig() {
    fs.writeFile(configFile, JSON.stringify(config), "utf-8", (err) => {
        if (err) log.error(err);
        log.info("[Giphy] Successfully wrote config to file " + configFile);
    });
}

function loadConfig() {
    fs.readFile(configFile, "utf-8", function (err, data) {
        if (err) log.error(err);
        try {
            config = JSON.parse(data);
            log.info("[Giphy] Loaded config from " + configFile);
        } catch (error) {
            log.error("[Giphy] Error while loading config: " + error);
            saveConfig();
        }
    });
}

function getGif(term) {
    return new Promise((resolve, reject) => {
        const args = qs.stringify({
            q: term,
            api_key: config.apiKey,
            limit: 1,
            rating: config.rating,
        });
        axios.get('http://api.giphy.com/v1/gifs/search?' + args)
            .then(function (response) {
                if (response && response.data && response.data.data && response.data.data && response.data.data[0]) {
                    resolve(getGifUrl(response.data.data[0]));
                } else {
                    reject("Error while getting gif: " + response);
                }
            })
            .catch(function (error) {
                console.log("test2");
                console.log(error);
                reject("Error while getting gif: " + error);
            });
    });
}

function getRandomGif() {
    return new Promise((resolve, reject) => {
        const args = qs.stringify({
            api_key: config.apiKey,
            rating: config.rating,
        });
        axios.get('http://api.giphy.com/v1/gifs/random?' + args)
            .then(function (response) {
                if (response && response.data && response.data.data) {
                    resolve(getGifUrl(response.data.data));
                } else {
                    reject("Error while getting gif: " + response);
                }
            })
            .catch(function (error) {
                reject("Error while getting gif: " + error);
            });
    });
}

function getGifUrl(data) {
    if (data.type === "gif") {
        return "https://i.giphy.com/" + data.id + ".gif";
    } else {
        return data.embed_url;
    }
}

const giphyCommand = {
    input: function (client, target, command, args) {
        if (args.length === 0) {
            client.sendMessage(red + "Usage: /giphy <random|search|rating|key>", target.chan);
            return;
        }
        switch (args[0]) {
            case "key":
                if (args.length === 1) {
                    client.sendMessage(red + "Usage: /giphy key <your-api-key>", target.chan);
                    client.sendMessage("For more info see <someurl>", target.chan);
                } else {
                    config.apiKey = args[1];
                    saveConfig();
                    client.sendMessage("API Key set. Happy giphying!", target.chan);
                }
                break;
            case "rating":
                if (args.length === 1 || !ratings.includes(args[1])) {
                    client.sendMessage(red + "Usage: /giphy rating <" + ratings.join("|") + ">", target.chan);
                    client.sendMessage("For more info see https://developers.giphy.com/docs/optional-settings#rating", target.chan);
                } else {
                    config.rating = args[1];
                    saveConfig();
                    client.sendMessage("Rating set to " + config.rating, target.chan);
                }
                break;
            case "search":
                if (args.length === 1) {
                    client.sendMessage(red + "Usage: /giphy search <term>", target.chan);
                } else if (config.apiKey === 'your-api-key') {
                    client.sendMessage(red + "Please set your api key using /giphy key <your-api-key>", target.chan);
                } else {
                    getGif(args.splice(1).join(" "))
                        .then(gif => client.runAsUser(gif, target.chan.id))
                        .catch(error => client.sendMessage(red + error, target.chan));
                }
                break;
            case "random":
                if (config.apiKey === 'your-api-key') {
                    client.sendMessage(red + "Please set your api key using /giphy key <your-api-key>", target.chan);
                } else {
                    getRandomGif()
                        .then(gif => client.runAsUser(gif, target.chan.id))
                        .catch(error => client.sendMessage(red + error, target.chan));
                }
                break;
            default:
                client.sendMessage(red + "Usage: /giphy <random|search|rating|key>", target.chan);
                break;
        }
    },
    allowDisconnected: true
};

module.exports = {
    onServerStart: api => {
        thelounge = api;
        thelounge.Commands.add("giphy", giphyCommand);
        loadConfig();
    },
};
