var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
    player_name: {
        type: String,
        required: true
    },
    password_hash: {
        type: String,
        required: true
    },
    player_id: {
        type: Number,
        required: false,
        default: 0
    },
    logged_in: {
        type: Boolean,
        required: false,
        default: false
    }
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;