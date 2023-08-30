const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_work_gallaries = new Schema({
    service_id : { type: Schema.Types.ObjectId, ref: "dqw_services" },
    user_id : { type: Schema.Types.ObjectId, ref: "dqw_provider" },
    c_id : { type: Schema.Types.ObjectId, ref: "dqw_provider" },
    user_type : String,
    before_work_pic: [{ type: String, required: true, trim: true }],
    after_work_pic: [{ type: String, required: true, trim: true }],
    creationDate:  Number,
    creationIp: String,
    updateDate: Number,
    updateIp: String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    },
}, {timestamps: true});

module.exports = mongoose.model('dqw_work_gallaries', dqw_work_gallaries);
