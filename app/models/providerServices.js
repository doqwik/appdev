const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_provider_services = new Schema({
  seq_id        : { type: Number, required: true, trim: true },
  company       : { type: Schema.Types.ObjectId, ref: "dqw_providers" },
  worker        : { type: Schema.Types.ObjectId, ref: "dqw_providers" },
  workerCompany : { type: Schema.Types.ObjectId, ref: "dqw_providers" },
  individual    : { type: Schema.Types.ObjectId, ref: "dqw_providers" },
  // provider      : { type: Schema.Types.ObjectId, ref: "dqw_providers" }, // Add the provider field
  user_id       : { type: Schema.Types.ObjectId, ref: "dqw_providers" }, // Add the provider field
  price         : Number,
  user_type     : String,
  //services      : [ { type: Schema.Types.ObjectId, ref: "dqw_services" } ],
  //subServices   : [ { type: Schema.Types.ObjectId, ref: "dqw_sub_services" } ],
  serviceData   : { type: Schema.Types.ObjectId, ref: "dqw_services" },
  // subServicesList   : [{ 
  //                       _id : { type: Schema.Types.ObjectId, ref: "dqw_sub_services" }, 
  //                       price       : Number,
  //                       category    : String
  //                     }],
  creationDate  : Number,
  status        : {
                  type: String,
                  enum: ["A","I"],            //A-Active, I-Inactive, B-Block, D-Delete
                  default: "A"
                },
}, {timestamps: true});

module.exports = mongoose.model('dqw_provider_services', dqw_provider_services);
