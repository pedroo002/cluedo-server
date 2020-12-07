var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const channelSchema = new Schema({
    channel_name: {
        type: String,
        required: true
    },
    auth_key: {
        type: String,
        required: true
    },
    max_user: {
        type: Number,
        required: true
    },
    subscribed_users: {
        type: Array,
        default: []
    },
    is_waiting: {
        type: Boolean,
        default: true
    },
    loaded_users: {
        type: Number,
        default: 0
    }
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;