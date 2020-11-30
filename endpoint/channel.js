module.exports = function(app, Channel) {
    app.get('/channel', async (req, res) => {
        try {
            const channels = await Channel.find();
            res.json(channels);
        } catch(err) {
            res.status(500).json({ message: err.message });
        }
    });
    
    app.get('/channel/:id', getChannel, async (req, res) => {
        res.json(res.channel);
    })
    
    app.get('/channel-by-limit', async (req, res) => {
        var channels = await Channel.find({ max_user: req.query.max_user });
        res.send(channels);
    });
    
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
    });
    
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
        });
    });
    
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
        });
    
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
    });
    
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
        });
    
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
    });
    
    app.delete('/channel/:id', getChannel, async (req, res) => {
        try {
            await Channel.deleteOne(res.channel);
            res.json({ message: "Channel has been deleted successfully." });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    app.delete('/channel', async (req, res) => {
        var allChannels = Channel.find();
        try {
            await Channel.deleteMany(allChannels);
            res.json({ message: "All channels have been deleted successfully." });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}

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