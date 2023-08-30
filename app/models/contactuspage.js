const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_contactus = new Schema({
	image: String,
    description:String,
    creation_date:  Date,
    creation_ip: String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_contactus', dqw_contactus);
