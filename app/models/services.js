const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_services = new Schema({
  service_image   : { type: String, trim: true },
  icon            : { type: String, trim: true }, 
  service_name    : { type: String, required: true, trim: true },
  service_slug    : { type: String, required: true, trim: true },
  sub_services    : [{ type: Schema.Types.ObjectId, ref: "dqw_sub_services" }],
  popular         : String,
  featured        : String,
  order_seq : Number,
  service_id : Number,
  creation_date:  Number,
  creation_ip: String,
  status: {
      type: String,
      enum: ["A","I"],            //A-Active, I-Inactive
      default: "A"
  }
}, {timestamps: true});
module.exports = mongoose.model('dqw_services', dqw_services);
