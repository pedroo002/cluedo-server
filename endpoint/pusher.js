module.exports = function(app, pusher, Channel) {
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
    });
    
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
    });
    
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
    });
    
    app.post('/draw-card', (req, res) => {
        let payload =
        {
            player_id: req.query.player_id,
            card_name: req.query.card_name
        }
        pusher.trigger(req.query.channel_name, 'card-drawing', payload);
        res.sendStatus(200);
    });
    
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
    });
    
    app.post('/game-ready', (req, res) => {
        let payload = {message: req.body.message, sender_id: req.body.sender_id}
        pusher.trigger(req.query.channel_name, 'game-ready', payload);
        res.sendStatus(200);
    });
    
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
    });
    
    app.post('/character-selected', (req, res) => {
        let payload =
        {
            message:
            {
                message: req.body.message,
                player_name: req.query.player_name,
                character_name: req.query.character_name
            },
            sender_id: req.body.sender_id
        }
        pusher.trigger(req.query.channel_name, 'character-selected', payload);
        res.sendStatus(200);
    });
    
    app.post('/channel-removed-before-join', (req, res) => {
        let payload = {message: req.body.message, sender_id: req.body.sender_id}
        pusher.trigger(req.query.channel_name, 'channel-removed-before-join', payload);
        res.sendStatus(200);
    });
    
    app.post('/channel-removed-after-join', (req, res) => {
        let payload = {message: req.body.message, sender_id: req.body.sender_id}
        pusher.trigger(req.query.channel_name, 'channel-removed-after-join', payload);
        res.sendStatus(200);
    });
    
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
    });
    
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
    });
    
    app.post('/new-player-added', (req, res) => {
        pusher.trigger(req.query.channel_name, 'new-player-added', {});
        res.sendStatus(200);
    });
    
    app.post('/refresh-multi-selector', (req, res) => {
        pusher.trigger(req.query.channel_name, 'catch-up', req.body);
        res.sendStatus(200);
    });
    
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
    });
    
    app.post('/ready-to-game', (req, res) => {
        pusher.trigger(req.query.channel_name, 'ready-to-game', req.query.player_name);
        res.sendStatus(200);
    });
    
    app.post('/fetch-cards', (req, res) => {
        let payload = {message: req.body.message, sender_id: req.body.sender_id};
        pusher.trigger(req.query.channel_name, 'fetch-cards', payload);
        res.sendStatus(200);
    });
    
    app.post('/map-loaded', async (req, res) => {
        var channel = await Channel.findOne({
            channel_name: req.query.channel_name
        },
        (err) => {
            if (err) {
                res.status(500).json({ message: err.message });
            }
        });
    
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
        });
    
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
    });
    
    app.post('/dark-cards-ready', (req, res) => {
        let payload = { message: req.body.message, sender_id: req.body.sender_id };
        pusher.trigger(req.query.channel_name, 'dark-cards-ready', payload);
        res.sendStatus(200);
    });
    
    app.post('/dark-cards-close', (req, res) => {
        let payload = { message: req.body.message, sender_id: req.body.sender_id };
        pusher.trigger(req.query.channel_name, 'dark-cards-close', payload);
        res.sendStatus(200);
    });
    
    app.post('/throw-helper-card', (req, res) => {
        let payload = 
        {
            player_id: req.query.player_id,
            card_name: req.query.card_name
        };
        pusher.trigger(req.query.channel_name, 'helper-card-thrown', payload);
        res.sendStatus(200);
    });
    
    app.post('/incrimination-details-ready', (req, res) => {
        let payload = { message: req.body.message, sender_id: req.body.sender_id };
        pusher.trigger(req.query.channel_name, 'incrimination-details-ready', payload);
        res.sendStatus(200);
    });
    
    app.post('/trigger-card-reveal', (req, res) => {
        let payload = req.query.player_id;
        pusher.trigger(req.query.channel_name, 'card-reveal-obligation', payload);
        res.sendStatus(200);
    });
    
    app.post('/show-helper-card', (req, res) => {
        let payload = 
        {
            player_id: req.query.player_id,
            card_name: req.query.card_name
        };
        pusher.trigger(req.query.channel_name, 'helper-card-shown', payload);
        res.sendStatus(200);
    });
    
    app.post('/skip-reveal', (req, res) => {
        let payload = req.query.player_id;
        pusher.trigger(req.query.channel_name, 'skip-reveal', payload);
        res.sendStatus(200);
    });
    
    app.post('/no-card', (req, res) => {
        let payload = { message: req.body.message, sender_id: req.body.sender_id }
        pusher.trigger(req.query.channel_name, 'nobody-showed-card', payload);
        res.sendStatus(200);
    });
    
    app.post('/incrimination-finished', (req, res) => {
        let payload = { message: req.body.message, sender_id: req.body.sender_id };
        pusher.trigger(req.query.channel_name, 'incrimination-finished', payload);
        res.sendStatus(200);
    });
    
    app.post('/note-closed', (req, res) => {
        let payload = {message: req.body.message, sender_id: req.body.sender_id}
        pusher.trigger(req.query.channel_name, 'note-closed', payload);
        res.sendStatus(200);
    });
    
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
}