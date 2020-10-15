const https = require('https');
const http = require('http');
const fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Pusher = require('pusher');
var Bcryptjs = require('bcryptjs');

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

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

var currentPlayer;

app.get('/channel', async (req, res) => {
    try {
        const channels = await Channel.find()
        res.json(channels)
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
})

app.get('/channel/:id', getChannel, async (req, res) => {
    res.json(res.channel);
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
                throw error;
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
                res.json(updatedChannel);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        }
        else {
            return res.status(400).json({ message: "Wrong authentication key." });
        }
    }
    else {
        return res.status(401).json({ message: "Channel is full." })
    }
})

app.put('/leave-channel/:id', getChannel, async (req, res) => {
    const player = await Player.findOne({
        player_name: req.body.player_name
    },
    (err, p) => {
        if (err) {
            throw err;
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
        res.status(400).json({ message: error.message });
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
        res.status(500).json({ message: err.message })
    }
})

app.get('/player/:id', getPlayer, async (req, res) => {
    res.json(res.player);
})

app.post('/player', async (req, res) => {
    Player.findOne({
        player_name: req.body.player_name
    },
    (err, player) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }

        if (player) {
            res.status(400).json({ message: "Player name already exists" });
        }

        var salt = Bcryptjs.genSaltSync(10);
        var hash = Bcryptjs.hashSync(req.body.password, salt);

        let newPlayer = new Player({
            player_name: req.body.player_name,
            player_id: req.body.player_id,
            password_hash: hash
        })

        newPlayer.save(function(error) {
            if (error) {
                throw error;
            }
        })

        currentPlayer = newPlayer;
        res.status(201).json(newPlayer);
    })
})

app.post('/login-player', async (req, res) => {
    const player = await Player.findOne({
        player_name: req.query.player_name
    },
    (err) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
    })

    if (player) {
        if (!Bcryptjs.compareSync(req.query.password, player.password_hash)) {
            return res.status(401).json({ message: "Password is incorrect." });
        } else {
            //res.status(200).send(player.player_name + " logged in succesfully.");
            res.status(200).send(player);
        }
    } else {
        res.status(404).json({ message: "Player \'" + req.body.player_name + "\' does not exist." });
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
        res.json({ message: "Player has been deleted successfully." });
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
        return res.status(500).json({ message: error.message })
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
        return res.status(500).json({ message: error.message })
    }

    res.player = player;
    next();
}

app.post('/incriminate', (req, res) => {
    let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.body.channel_name, 'incrimination', payload);
    res.send(200);
})

app.post('/accuse', (req, res) => {
	let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.body.channel_name, 'accusation', payload);
    res.send(200);
})

app.post('/move', (req, res) => {
	let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.body.channel_name, 'player-moves', payload);
    res.send(200);
})

app.post('/draw-card', (req, res) => {
	let payload = {message: req.body.message, sender_id: req.body.sender_id}
    pusher.trigger(req.body.channel_name, 'card-drawing', payload);
    res.send(200);
})

app.post('/pusher/auth/presence', (req, res) => {
    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;

    let presenceData = {
        player_name: currentPlayer.player_name,
        player_info: { id: currentPlayer.player_id, channel: currentPlayer.channel_name }
    };

    let auth = pusher.authenticate(socketId, channel, presenceData);

    res.status(200).send(auth);
});

app.post('/pusher/auth/private', (req, res) => {
    res.status(200).send(pusher.authenticate(req.body.socket_id, req.body.channel_name));
});

app.get('/test', (req, res) => {
    res.status(200).send("Server works.");
});

var httpsServer = https.createServer(options, app);
var httpServer = http.createServer(app);

httpsServer.listen(443);
httpServer.listen(80);