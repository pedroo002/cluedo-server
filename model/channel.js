var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const channelSchema = new Schema({
    channel_name: {
        type: String,
        required: true
    },
    auth_key: {
        type: Number,
        required: true
    },
    max_user: {
        type: Number,
        required: true
    },
    subscribed_users: {
        type: Array,
        default: []
    }
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;