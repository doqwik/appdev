const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_about_us = new Schema({
	image: String,
    description:String,
    section_2_title:String,
    section_2_sub_title: String,
    section_2_description_left: String,
    section_2_description_right: String,
    section_2_description: String,
    section_2_description_left1: String,
    section_2_sub_title1: String,
    section_2_title1: String,
    creation_date:  Date,
    creation_ip: String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_about_us', dqw_about_us);
