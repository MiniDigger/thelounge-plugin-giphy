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
    rating: "g",
};
let thelounge = null;

const ratings = ['G', 'PG', 'PG-13', 'R'];

function sendMessage(text, chan, client) {
    chan.pushMessage(client.client, new Msg({
        type: Msg.Type.ERROR, //TODO send "normal" message
        text: text,
    }));
}

function sendErrorMessage(text, chan, client) {
    chan.pushMessage(client.client, new Msg({
        type: Msg.Type.ERROR,
        text: text,
    }));
}

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
                if (response && response.data && response.data.data && response.data.data.embed_url) {
                    resolve(response.data.data.embed_url);
                } else {
                    reject("Error while getting gif: " + response);
                }
            })
            .catch(function (error) {
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
                if (response && response.data && response.data.data && response.data.data.embed_url) {
                    resolve(response.data.data.embed_url);
                } else {
                    reject("Error while getting gif: " + response);
                }
            })
            .catch(function (error) {
                reject("Error while getting gif: " + error);
            });
    });
}

const giphyCommand = {
    input: function (client, target, command, args) {
        if (args.length === 0) {
            sendErrorMessage("Usage: /giphy <random|search|rating|key>", target.chan, client);
            return;
        }
        switch (args[0]) {
            case "key":
                if (args.length === 1) {
                    sendErrorMessage("Usage: /giphy key <your-api-key>", target.chan, client);
                    sendMessage("For more info see <someurl>", target.chan, client);
                } else {
                    config.apiKey = args[1];
                    saveConfig();
                    sendMessage("API Key set. Happy giphying!", target.chan, client);
                }
                break;
            case "rating":
                if (args.length === 1 || !ratings.includes(args[1])) {
                    sendErrorMessage("Usage: /giphy rating <" + ratings.join("|") + ">", target.chan, client);
                    sendMessage("For more info see https://developers.giphy.com/docs/optional-settings#rating", target.chan, client);
                } else {
                    config.rating = args[1];
                    saveConfig();
                    sendMessage("Rating set to " + config.rating, target.chan, client);
                }
                break;
            case "search":
                if (args.length === 1) {
                    sendErrorMessage("Usage: /giphy search <term>", target.chan, client);
                } else {
                    getGif(args.splice(1).join(" "))
                        .then(gif => client.runAsUser(gif, target.chan.id))
                        .catch(error => sendErrorMessage(error, target.chan, client));
                }
                break;
            case "random":
                getRandomGif()
                    .then(gif => client.runAsUser(gif, target.chan.id))
                    .catch(error => sendErrorMessage(error, target.chan, client));
                break;
            default:
                sendErrorMessage("Usage: /giphy <random|search|rating|key>", target.chan, client);
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
