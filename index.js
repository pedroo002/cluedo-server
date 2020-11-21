const https = require('https');
const http = require('http');
const fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var serveStatic = require('serve-static');
var path = require('path');

var Pusher = require('pusher');
var Bcryptjs = require('bcryptjs');

var Player = require('./model/player.js');
var Channel = require('./model/channel.js');
const { ppid } = require('process');

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

const util = require('util');
const { debug } = require('console');
const debuglog = util.debuglog('app');

app.get('/channel', async (req, res) => {
    try {
        const channels = await Channel.find()
        res.json(channels)
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
})

app.get('/channel/:id', getChannel, async (req, res) => {
    res.json(res.channel);
})

app.get('/channel-by-limit', async (req, res) => {
    var channels = await Channel.find({ max_user: req.query.max_user });
    res.send(channels);
})

app.put('/stop-waiting/:id', getChannel, async (req, res) => {
    var channel = res.channel;
    channel.is_waiting = false;
    try {
        var updatedChannel = await channel.save();
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        res.status(203).json(updatedChannel);
    }
})

app.post('/channel', async (req, res) => {
    Channel.findOne({
        channel_name: req.body.channel_name
    },
    (err, channel) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
        
        if (channel) {
            res.status(400).json({ message: "Channel already exists" });
        }

        let newChannel = new Channel({
            channel_name: req.body.channel_name,
            auth_key: req.body.auth_key,
            max_user: req.body.max_user
        });

        newChannel.save(function(error) {
            if (error) {
                res.status(500).json(error);
            }
        });

        res.status(201).json(newChannel);
    })
})

app.put('/join-channel/:id', getChannel, async (req, res) => {
    const player = await Player.findOne({
        player_name: req.body.player_name
    },
    (err, p) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        if (p == null) {
            return res.status(404).json({ message: "Player is not found." });
        }
    })

    if (res.channel.subscribed_users.includes(player.player_name)) {
        return res.status(400).json({ message: "Player is already subscribed to this channel." });
    }

    if (res.channel.subscribed_users.length < res.channel.max_user) {
        if (req.body.auth_key == res.channel.auth_key) {
            res.channel.subscribed_users.splice(0, 0, req.body.player_name);
            try {
                const updatedChannel = await res.channel.save();
                res.status(203).json(updatedChannel);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        }
        else {
            return res.status(403).json({ message: "Wrong authentication key." });
        }
    }
    else {
        return res.status(401).json({ message: "Channel is full." });
    }
})

app.put('/leave-channel/:id', getChannel, async (req, res) => {
    const player = await Player.findOne({
        player_name: req.query.player_name
    },
    (err, p) => {
        if (err) {
            res.status(500).json(err);
        }

        if (p == null) {
            return res.status(404).json({ message: "Player is not found." });
        }
    })

    const index = res.channel.subscribed_users.indexOf(player.player_name);
    if (index == -1) {
        return res.status(400).json({ message: "Player is not subscribed to this channel." });
    }
    res.channel.subscribed_users.splice(index, 1);
    try {
        const updatedChannel = await res.channel.save();
        res.json(updatedChannel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.delete('/channel/:id', getChannel, async (req, res) => {
    try {
        await Channel.deleteOne(res.channel);
        res.json({ message: "Channel has been deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.delete('/channel', async (req, res) => {
    var allChannels = Channel.find();
    try {
        await Channel.deleteMany(allChannels);
        res.json({ message: "All channels have been deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.get('/player', async (req, res) => {
    try {
        const players = await Player.find()
        res.json(players)
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
})

app.get('/player/:id', getPlayer, async (req, res) => {
    res.json(res.player);
})

app.post('/player', async (req, res) => {
    Player.findOne({
        player_name: req.body.player_name
    },
    async (err, player) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }

        if (player) {
            res.status(400).json({ message: "Player name already exists" });
        }

        var salt = Bcryptjs.genSaltSync(10);
        var hash = Bcryptjs.hashSync(req.body.password, salt);

        var allPlayers = await Player.find().countDocuments();

        let newPlayer = new Player({
            player_name: req.body.player_name,
            password_hash: hash,
            player_id: allPlayers
        })

        newPlayer.save(function(error) {
            if (error) {
                res.status(500).json(error);
            }
        })
        res.status(201).json(newPlayer);
    })
})

app.put('/login-player', async (req, res) => {
    const player = await Player.findOne({
        player_name: req.body.player_name
    },
    (err) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
    })

    if (player) {
        if (!Bcryptjs.compareSync(req.body.password, player.password_hash)) {
            return res.status(401).json({ message: "Password is incorrect." });
        } else {
            if (!player.logged_in) {
                player.logged_in = true;
                try {
                    await player.save();
                    res.status(200).json(player);
                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            }
            else {
                res.status(400).json({ message: "Player \'" + player.player_name + "\' is already logged in." });
            }
        }
    } else {
        res.status(404).json({ message: "Player \'" + req.body.player_name + "\' does not exist." });
    }
})

app.put('/logout-player', async (req, res) => {
    const player = await Player.findOne({
        player_name: req.body.player_name
    },
    (err) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
    })

    if (player) {
        if (!Bcryptjs.compareSync(req.body.password, player.password_hash)) {
            return res.status(401).json({ message: "Password is incorrect." });
        } else {
            if (player.logged_in) {
                player.logged_in = false;
                try {
                    await player.save();
                    res.status(200).json({ message: "Player \'" + player.player_name + "\' logged out succesfully." });
                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            }
            else {
                res.status(400).json({ message: "Player \'" + player.player_name + "\' is not logged in." });
            }
        }
    } else {
        res.status(404).json({ message: "Player \'" + req.body.player_name + "\' does not exist." });
    }
})

app.put('/reset', async (req, res) => {
    const players = await Player.find();
    for (let i = 0; i < players.length; i++) {
        if (players[i].logged_in) {
            players[i].logged_in = false;
            try {
                await players[i].save();
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
    }

    var allChannels = Channel.find();
    try {
        await Channel.deleteMany(allChannels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        res.send("Server reset.");
    }
})

app.delete('/player/:id', getPlayer, async (req, res) => {
    const player = res.player;
    var channels = await Channel.find();
    for (let i = 0; i < channels.length; i++) {
        var ch = channels[i];
        if (ch.subscribed_users.includes(player.player_name)) {
            const index = ch.subscribed_users.indexOf(player.player_name);
            ch.subscribed_users.splice(index, 1);
            try {
                const updatedChannel = await ch.save();
                res.json(updatedChannel);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        }
    }

    try {
        await Player.deleteOne(player);
        res.json({ message: "Player \'" + player.player_name + "\' has been deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.delete('/player', async (req, res) => {
    var allPlayers = Player.find();
    try {
        Player.deleteMany(allPlayers);
        res.json({ message: "All players have been deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    var channels = await Channel.find();
    for (let i = 0; i < channels.length; i++) {
        var ch = channels[i];
        ch.subscribed_users = new Array();
        try {
            await ch.save();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
})

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

app.post('/incriminate', (req, res) => {
    let payload =
    {
        player_id: req.body.player_id,
        room: req.body.room,
        tool: req.body.tool,
        suspect: req.body.suspect
    }
    pusher.trigger(req.query.channel_name, 'incrimination', payload);
    res.sendStatus(200);
})

app.post('/accuse', (req, res) => {
	let payload =
    {
        player_id: req.body.player_id,
        room: req.body.room,
        tool: req.body.tool,
        suspect: req.body.suspect
    }
    pusher.trigger(req.query.channel_name, 'accusation', payload);
    res.sendStatus(200);
})

app.post('/move', (req, res) => {
    let payload = 
    {
        player_id: req.body.player_id,
        target_position:
        {
            row: req.body.target_position.row,
            col: req.body.target_position.col
        }
    }
    pusher.trigger(req.query.channel_name, 'player-moves', payload);
    res.sendStatus(200);
})

app.post('/draw-card', (req, res) => {
    let payload =
    {
        player_id: req.query.player_id,
        card_name: req.query.card_name
    }
    pusher.trigger(req.query.channel_name, 'card-drawing', payload);
    res.sendStatus(200);
})

app.post('/dice', (req, res) => {
    let payload = 
    {
        player_id: req.body.player_id,
        first_value: req.body.first_value,
        second_value: req.body.second_value,
        extra_value: req.body.extra_value
    }
    pusher.trigger(req.query.channel_name, 'dice-event', payload);
    res.sendStatus(200);
})

app.post('/game-ready', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'game-ready', payload);
    res.sendStatus(200);
})

app.post('/character-submit', (req, res) => {
    let payload = 
    {
        message:
        {
            message: req.body.message,
            player_name: req.query.player_name,
        },
        sender_id: req.body.sender_id
    }
    pusher.trigger(req.query.channel_name, 'character-submit', payload);
    res.sendStatus(200);
})

app.post('/character-selected', (req, res) => {
    let payload =
    {
        message:
        {
            message: req.body.message,
            player_name: req.query.player_name,
            character_name: req.query.character_name,
            token_src: req.query.token_src
        },
        sender_id: req.body.sender_id
    }
    pusher.trigger(req.query.channel_name, 'character-selected', payload);
    res.sendStatus(200);
})

app.post('/channel-removed-before-join', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'channel-removed-before-join', payload);
    res.sendStatus(200);
})

app.post('/channel-removed-after-join', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'channel-removed-after-join', payload);
    res.sendStatus(200);
})

app.post('/player-leaves', (req, res) => {
    let payload =
    {
        message: 
        {
            message: req.body.message,
            player_name: req.query.player_name
        },
        sender_id: req.body.sender_id
    }
    pusher.trigger(req.query.channel_name, 'player-leaves', payload);
    res.sendStatus(200);
})

app.post('/player-arrives', (req, res) => {
    let payload =
    {
        message:
        {
            message: req.body.message,
            player_name: req.query.player_name
        },
        sender_id: req.body.sender_id
    }
    pusher.trigger(req.query.channel_name, 'player-arrives', payload);
    res.sendStatus(200);
})

app.post('/new-player-added', (req, res) => {
    pusher.trigger(req.query.channel_name, 'new-player-added', {});
    res.sendStatus(200);
})

app.post('/refresh-multi-selector', (req, res) => {
    pusher.trigger(req.query.channel_name, 'catch-up', req.body);
    res.sendStatus(200);
})

app.post('/mystery-pairs', (req, res) => {
    let payload = 
    {
        message:
        {
            pairs: req.body.message.pairs
        },
        sender_id: req.body.sender_id
    }
    pusher.trigger(req.query.channel_name, 'mystery-card-pairs', payload);
    res.sendStatus(200);
})

app.post('/ready-to-game', (req, res) => {
    pusher.trigger(req.query.channel_name, 'ready-to-game', req.query.player_name);
    res.sendStatus(200);
})

app.post('/fetch-cards', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id};
    pusher.trigger(req.query.channel_name, 'fetch-cards', payload);
    res.sendStatus(200);
})

app.post('/map-loaded', async (req, res) => {
    var channel = await Channel.findOne({
        channel_name: req.query.channel_name
    },
    (err) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
    })

    if (channel) {
        channel.loaded_users = channel.loaded_users + 1;
        try {
            await channel.save();
            if (channel.loaded_users == channel.subscribed_users.length) {
                let payload = {message: req.body.message, sender_id: req.body.sender_id};
                pusher.trigger("presence-" + req.query.channel_name, 'map-loaded', payload);
            }
            res.sendStatus(200);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    else {
        res.status(404).json({ message: 'Channel not found.' });
    }
})

app.post('/mystery-cards-activity-loaded', async (req, res) => {
    var channel = await Channel.findOne({
        channel_name: req.query.channel_name
    },
    (err) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
    })

    if (channel) {
        channel.loaded_users = channel.loaded_users + 1;
        try {
            await channel.save();
            if (channel.loaded_users == channel.subscribed_users.length) {
                let payload = {message: req.body.message, sender_id: req.body.sender_id};
                pusher.trigger("presence-" + req.query.channel_name, 'fetch-cards', payload);
                channel.loaded_users = 0;
                await channel.save();
            }
            res.sendStatus(200);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    else {
        res.status(404).json({ message: 'Channel not found.' });
    }
})

app.post('/dark-cards-ready', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'dark-cards-ready', payload);
    res.sendStatus(200);
})

app.post('/dark-cards-close', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'dark-cards-close', payload);
    res.sendStatus(200);
})

app.post('/throw-helper-card', (req, res) => {
    let payload = 
    {
        player_id: req.query.player_id,
        card_name: req.query.card_name
    }
    pusher.trigger(req.query.channel_name, 'helper-card-thrown', payload);
    res.sendStatus(200);
})

app.post('/incrimination-details-ready', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'incrimination-details-ready', payload);
    res.sendStatus(200);
})

app.post('/trigger-card-reveal', (req, res) => {
    let payload = req.query.player_id;
    pusher.trigger(req.query.channel_name, 'card-reveal-obligation', payload);
    res.sendStatus(200);
})

app.post('/show-helper-card', (req, res) => {
    let payload = 
    {
        player_id: req.query.player_id,
        card_name: req.query.card_name
    }
    pusher.trigger(req.query.channel_name, 'helper-card-shown', payload);
    res.sendStatus(200);
})

app.post('/skip-reveal', (req, res) => {
    let payload = req.query.player_id;
    pusher.trigger(req.query.channel_name, 'skip-reveal', payload);
    res.sendStatus(200);
})

app.post('/no-card', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'nobody-showed-card', payload);
    res.sendStatus(200);
})

app.post('/incrimination-finished', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'incrimination-finished', payload);
    res.sendStatus(200);
})

app.post('/note-closed', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.query.channel_name, 'note-closed', payload);
    res.sendStatus(200);
})

app.post('/pusher/auth/presence', (req, res) => {
    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;

    let presenceData = {
        user_id: socketId,
        user_info: { channel_name: channel }
    };

    let auth = pusher.authenticate(socketId, channel, presenceData);

    res.status(200).send(auth);
});

app.post('/pusher/auth/private', (req, res) => {
    res.status(200).send(pusher.authenticate(req.body.socket_id, req.body.channel_name));
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/.well-known/pki-validation', express.static(path.join(__dirname, '/.well-known/pki-validation'), { 'dotfiles': 'allow' }));

var httpsServer = https.createServer(credentials, app);
var httpServer = http.createServer(app);

httpsServer.listen(443);
httpServer.listen(80);