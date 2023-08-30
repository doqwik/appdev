const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_sub_services = new Schema({
	sub_service_image: { type: String, trim: true },
	sub_service_name: { type: String, required: true, trim: true },
	service_id: { type: Number, required: true, trim: true },
	service_name: { type: String, required: true, trim: true },
    service_sub_id: { type: String, required: true, trim: true },
    service_oid : { type: Schema.Types.ObjectId, ref: "dqw_services" },
    revenue       : Number,
    creation_date : Number,
    creation_ip : String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_sub_services', dqw_sub_services);
