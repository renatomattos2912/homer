'use strict';

var five = require('johnny-five');
var board = new five.Board();
var builder = require('botbuilder');
var express = require('express');
var config = require('./config');
var server = express();
/*
 App Id: 6dbc8870-1df6-4401-b1f2-f1971e5a6c8f
 Pass: JhTGfYRPK8jYixtzhDYL2mw
 Cortana Model: https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c413b2ef-382c-45bd-8ff0-f76d60e2a821?subscription-key=5219e7e40f374f90bf228a8f0e869e78&q=
 */
board.on('ready', function() {
    console.log('Is Ready');
});

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('listening to ' + this.address().port);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
    //appId: '6dbc8870-1df6-4401-b1f2-f1971e5a6c8f',
    //appPassword: 'JhTGfYRPK8jYixtzhDYL2mw'
});

var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Oi, sou o renato, irei ajudar você a comprar seu novo produto microsoft");
});

server.post('/api/messages', connector.listen());

// Add global LUIS recognizer to bot
var model = config.bot.model;
bot.recognizer(new builder.LuisRecognizer(model));

// Set Alarm dialog
bot.dialog('/buySomething', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        var intent = args.intent;
        var product = builder.EntityRecognizer.findEntity(intent.entities, 'buy');

        var buy = session.dialogData.buy = {
            product: product ? product.entity : null
        };

        console.log(intent);
        console.log(product);

        // Prompt for title
        if (!buy.product) {
            builder.Prompts.text(session, 'O que você deseja comprar?');
        } else {
            next();
        }
    },
    function (session, results) {
        var buy = session.dialogData.buy;

        console.log(buy);
        if (results.response) {
            console.log(results.response);
            buy.product = results.response;
        }

        var led = new five.Led(13); // pin 13
        led.on(); // 500ms interval

        setTimeout(function() { led.off(); }, 3000)

        session.endDialog('Você acabou de comprar um ' + buy.product);
    },
]).triggerAction({
    matches: 'buySomething',
    //confirmPrompt: "Isso irá cancelar a operaçã atual. Deseja isso mesmo?"
}).cancelAction('cancelSetAlarm', "Operação cancelada.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Tem certeza?"
});

/*board.on('ready', function() {
    var led = new five.Led(13); // pin 13
    led.blink(500); // 500ms interval
});*/