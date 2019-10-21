"use strict";

const Msg = require("thelounge/src/models/msg");

const code = "";

let thelounge = null;

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

const giphyCommand = {
    input: function (client, target, command, args) {
        if (args.length === 0) {
            sendErrorMessage("Usage: /giphy <stuff>", target.chan, client);
            return;
        }
        switch (args[0]) {
            case "stuff":

            default:
                sendErrorMessage("Usage: /giphy <stuff>", target.chan, client);
                break;
        }
    },
    allowDisconnected: true
};

module.exports = {
    onServerStart: api => {
        thelounge = api;
        thelounge.Commands.add("giphy", giphyCommand);
    },
};
