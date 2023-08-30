const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_coupons = new Schema({
  
    coupon_code: { type: String, required: true, trim: true },
    discount:  Number,
    creationDate:  Number,
    creationIp: String,
    updateDate: Number,
    updateIp: String,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_coupons', dqw_coupons);
