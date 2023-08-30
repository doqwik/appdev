const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_states = new Schema({
  
    country_id      : Number,
    country_name    : { type: String, required: true, trim: true },
    country_oid     : { type: Schema.Types.ObjectId, ref: "dqw_country" },

    state           : { type: String, required: true, trim: true },
    state_id        : Number,
    
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

module.exports = mongoose.model('dqw_states', dqw_states);
