const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_verifyOtps = new Schema({
    phone: Number,
    email: String,
    code: String,
    createdOn: Date
});

module.exports = mongoose.model('dqw_verifyOtps', dqw_verifyOtps);