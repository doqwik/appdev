const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_page_headings  = new Schema({
	image: { type: String, required: true, trim: true },
	page: { type: String, required: true, trim: true },
	display: { type: String, required: true, trim: true },
	heading: [ {
        title : { type: String, trim: true },
        description : { type: String, trim: true },
    }],
    heading_id : { type: Number, required: true, trim: true },
    
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

module.exports = mongoose.model('dqw_page_headings', dqw_page_headings );
