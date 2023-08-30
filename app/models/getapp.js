const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_getapps  = new Schema({
	image: { type: String, required: true, trim: true },
	title: [ { type: String, trim: true }],
    status: {
        type: String,
        enum: ["A","I"],            //A-Active, I-Inactive
        default: "A"
    },
    creation_date : Number,
    created_by: Number,
    creation_ip: String,

    update_date : Number,
    update_ip : String,
    update_ip: Number,

}, {timestamps: true});

module.exports = mongoose.model('dqw_getapps', dqw_getapps );
