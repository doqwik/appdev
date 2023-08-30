const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_testimonials = new Schema({
	image: String,
    name:String,
    description1:String,
    description2: String,
    description: String,
    testimonial_id: String,
    creation_date:  Date,
    creation_ip: String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_testimonials', dqw_testimonials);
