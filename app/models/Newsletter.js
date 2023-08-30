const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_newsletter = new Schema({
    seq_id      : { type: Number, required: true, trim: true },
    email       : { type: String, required: true, trim: true },
    created_at  :   Number,
    status: {
        type: String,
        enum: ["A","I"],            //A-Active, I-Inactive
        default: "A"
    }
}, {timestamps: true});
module.exports = mongoose.model('dqw_newsletter', dqw_newsletter); 