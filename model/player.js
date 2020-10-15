var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
    player_name: {
        type: String,
        required: true
    },
    player_id: {
        type: Number,
        default: 0
    },
    password_hash: {
        type: String,
        required: true
    }
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;