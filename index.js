const https = require('https');
const http = require('http');
const fs = require('fs');

var express = require('express');
var mongoose = require('mongoose');
var path = require('path');

var Pusher = require('pusher');

var Player = require('./model/player.js');
var Channel = require('./model/channel.js');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var pusher = new Pusher({
    appId: '1077009',
    key: '5027f870d695dcedaa00',
    secret: '2753fceda0424e185446',
    cluster: 'eu'
});

mongoose.connect('mongodb://localhost:27017/cluedo_communication', {useNewUrlParser: true, useUnifiedTopology: true });

const credentials = {
    key: fs.readFileSync('letsencrypt/pedro.sch.bme.hu/private.key'),
    cert: fs.readFileSync('letsencrypt/pedro.sch.bme.hu/certificate.crt'),
    ca: fs.readFileSync('letsencrypt/pedro.sch.bme.hu/ca_bundle.crt')
};

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/.well-known/pki-validation', express.static(path.join(__dirname, '/.well-known/pki-validation'), { 'dotfiles': 'allow' }));

let channelEndpoints = require('./endpoint/channel.js');
let playerEndpoints = require('./endpoint/player.js');
let pusherEndpoints = require('./endpoint/pusher.js');
let assetEndpoint = require('./endpoint/assets.js');

async function getChannel(req, res, next) {
    let channel
    try {
        channel = await Channel.findById(req.params.id);
        if (channel == null) {
            return res.status(404).json({ message: 'Cannot find channel.' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.channel = channel;
    next();
}

async function getPlayer(req, res, next) {
    let player
    try {
        player = await Player.findById(req.params.id);
        if (player == null) {
            return res.status(404).json({ message: 'Cannot find player.' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.player = player;
    next();
}

channelEndpoints(app, Player, Channel, getChannel);
playerEndpoints(app, Player, Channel, getPlayer);
pusherEndpoints(app, pusher, Channel);
assetEndpoint(app, __dirname);

var httpsServer = https.createServer(credentials, app);
var httpServer = http.createServer(app);

httpsServer.listen(443);
httpServer.listen(80);