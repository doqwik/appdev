const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_countries = new Schema({
  
    country         : { type: String, required: true, trim: true },
    icon            : String,
    country_code    : Number,
    country_id      : Number,

    creation_ip     : String,
    creation_date   : Number,
    created_by      : Number,
    
    update_date      : Number,
    update_ip        : String,
    updated_by       : Number,
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    }
}, {timestamps: true});

module.exports = mongoose.model('dqw_countries', dqw_countries);
