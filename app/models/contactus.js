const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_contactus = new Schema({
	firstName: { type: String, required: true, trim: true },
	lastName: { type: String, required: true, trim: true },
    inquiry : { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    creationDate:  Number,
}, {timestamps: true});

module.exports = mongoose.model('dqw_contactus', dqw_contactus);
