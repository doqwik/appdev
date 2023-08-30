const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_email_log = new Schema({
    email       : String,
    mail_type   : String,
	respounse   : { type: String, trim: true },
    status      : String,
    creationDate:  Number,
}, {timestamps: true});

module.exports = mongoose.model('dqw_email_log', dqw_email_log);
