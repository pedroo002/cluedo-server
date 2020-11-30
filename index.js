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

channelEndpoints(app, Channel);
playerEndpoints(app, Player, Channel);
pusherEndpoints(app, pusher);
assetEndpoint(app, __dirname);

var httpsServer = https.createServer(credentials, app);
var httpServer = http.createServer(app);

httpsServer.listen(443);
httpServer.listen(80);