const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_banners  = new Schema({
	image: { type: String, required: true, trim: true },
	page: { type: String, required: true, trim: true },
	display: { type: String, required: true, trim: true },
	title: [{ type: String, trim: true }],
    banner_id : { type: Number, required: true, trim: true },
    seq_order : Number,
    creation_date : Number,
    created_by: Number,
    creation_ip: String,
    status: {
        type: String,
        enum: ["A","I"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_banners', dqw_banners );
