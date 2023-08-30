const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_privacy_policies  = new Schema({
	heading1: [ {
        title : { type: String, trim: true },
        description : { type: String, trim: true },
    }],
	heading: [ {
        title : { type: String, trim: true },
        description : { type: String, trim: true },
    }],
      heading2: [{
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    main_description: [{
      title: { type: String, trim: true },
      description: { type: String, trim: true },
    }],
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

module.exports = mongoose.model('dqw_privacy_policies', dqw_privacy_policies );
