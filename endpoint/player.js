var Bcryptjs = require('bcryptjs');

module.exports = function(app, Player, Channel) {
    app.get('/player', async (req, res) => {
        try {
            const players = await Player.find();
            res.json(players);
        } catch(err) {
            res.status(500).json({ message: err.message });
        }
    });
    
    app.get('/player/:id', getPlayer, async (req, res) => {
        res.json(res.player);
    });
    
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
        });
    });
    
    app.put('/login-player', async (req, res) => {
        const player = await Player.findOne({
            player_name: req.body.player_name
        },
        (err) => {
            if (err) {
                res.status(500).json({ message: err.message });
            }
        });
    
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
    });
    
    app.put('/logout-player', async (req, res) => {
        const player = await Player.findOne({
            player_name: req.body.player_name
        },
        (err) => {
            if (err) {
                res.status(500).json({ message: err.message });
            }
        });
    
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
    });
    
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
    });
    
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
    });
    
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
    });
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