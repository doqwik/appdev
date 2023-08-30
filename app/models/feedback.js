const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_feedbacks = new Schema({
    user_id : { type: Schema.Types.ObjectId, ref: "dqw_users" },
    user_seq_id : { type: Number, trim: true },
    worker_id : { type: Schema.Types.ObjectId, ref: "dqw_providers" },
    review : String,
    reply : String,
    star :  String,
    reply_star :  String,
    creationDate:  Number,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    },
}, {timestamps: true});

module.exports = mongoose.model('dqw_feedbacks', dqw_feedbacks);
