const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_sms_log = new Schema({
    phone       : Number,
	respounse   : { type: String, trim: true },
    creationDate:  Number,
}, {timestamps: true});

module.exports = mongoose.model('dqw_sms_log', dqw_sms_log);
