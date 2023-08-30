const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_users = new Schema({
    users_id : { type: Number, trim: true },
	fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: Number, maxlength: 10, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address1: { type: String, trim: true },
    address2: { type: String, trim: true },
    land_mark: { type: String, required: true, trim: true },
    postal_code: { type: String, required: true, trim: true },
    addressData : [{ type: Schema.Types.ObjectId, ref: "dqw_addresses" }],
    token: String, 
    profile_pic: String,
    document: String,
    documentNo: String,
    documentType: String,
    isVerified : Number,
    creationDate:  Number,
    creationIp: String,
    updateDate: Number,
    updateIp: String,
    defaultAddress      : { type: Schema.Types.ObjectId, ref: "dqw_addresses" },
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

module.exports = mongoose.model('dqw_users', dqw_users);
