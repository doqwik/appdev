const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_reasons = new Schema({
	section_1_title: String,
    section_2_title:String,
    
    creation_date:  Date,
    creation_ip: String,
    status: {
        type: String,
        enum: ["A","I"],            //A-Active, I-Inactive
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_reasons', dqw_reasons);
