const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_counters = new Schema({
    _id        : { type: String, required: true, trim: true },
    seq        : { type: Number, required: true, trim: true },
    encrypted  : { type: Number, required: true, trim: true },
})
module.exports = mongoose.model('dqw_counters', dqw_counters); 