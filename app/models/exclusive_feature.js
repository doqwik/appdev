const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_exclusive_features = new Schema({
    features_id     : { type: Number, required: true, trim: true },
    description     : { type: String, required: true, trim: true },
    seq_order       : Number,
    created_at  :   Number,
    status: {
        type: String,
        enum: ["A","I"],            //A-Active, I-Inactive
        default: "A"
    }
}, {timestamps: true});
module.exports = mongoose.model('dqw_exclusive_features', dqw_exclusive_features); 