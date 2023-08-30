const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_notifications_details = new Schema({
    notification_details_id : Number,
    users_id : Number,
    notification_id : Number,
    notific_title : { type: String,required: true, trim: true },
	notific_message : { type: String, required: true, trim: true },
    link : String,
    image: String, 
    is_read : String,
    
    creation_date:  Number,
    creation_ip: String,
    created_by : Number,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    },
}, {timestamps: true});

module.exports = mongoose.model('dqw_notifications_details', dqw_notifications_details);
