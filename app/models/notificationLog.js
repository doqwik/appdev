const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_notification_log = new Schema({
    user_id     : String,
    title       : String,
	respounse   : { type: String, trim: true },
    status      : String,
    creationDate:  Number,
}, {timestamps: true});

module.exports = mongoose.model('dqw_notification_log', dqw_notification_log);
