const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_addresses = new Schema({
    user_id : { type: Schema.Types.ObjectId, ref: "dqw_users" },
    user_seq_id : { type: Number, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address1: { type: String, trim: true },
    address2: { type: String, trim: true },
    land_mark: { type: String, required: true, trim: true },
    postal_code: { type: String, required: true, trim: true },
   creationDate:  Number,
    creationIp: String,
    updateDate: Number,
    updateIp: String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    },
    latitude : Number,
    longitude : Number,
    device_id : String,
    platform : String
}, {timestamps: true});

module.exports = mongoose.model('dqw_addresses', dqw_addresses);
