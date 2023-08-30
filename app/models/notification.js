const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_notifications = new Schema({
    title : { type: String,required: true, trim: true },
	text: { type: String, required: true, trim: true },
    image: String, 
    isVerified : Number,
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

module.exports = mongoose.model('dqw_notifications', dqw_notifications);
