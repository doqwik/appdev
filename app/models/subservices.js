const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_feacture_services = new Schema({
	feacture_service_image: String,
    feacture_service_name:String,
    most_popular_service_name:String,
    feacture_service_id: String,
    most_popular_service_id: String,
    creation_date:  Date,
    creation_ip: String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_feacture_services', dqw_feacture_services);
