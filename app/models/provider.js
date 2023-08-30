const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_providers = new Schema({
    seq_id              : { type: Number, required: true, trim: true },
	  fullName            : { type: String, required: true, trim: true },
    email               : { type: String, required: true, trim: true },
    phone               : { type: Number, trim: true },
    country             : { type: String, required: true, trim: true },
    state               : { type: String, required: true, trim: true },
    city                : { type: String, required: true, trim: true },
  
    land_mark           : { type: String, required: true, trim: true },
    postal_code         : { type: String, required: true, trim: true },
    bankAcountNumber    : { type: Number, trim: true },
    tinNumber           : { type: String, trim: true },
    companyRegNo        : { type: String, trim: true },
    identificationType  : { type: String, trim: true },
    identificationNumber: { type: String, trim: true },
    userType            : { type: String, required: true, trim: true },
    companyData         : { type: Schema.Types.ObjectId, ref: "dqw_providers" },

    companyName         : { type: String, trim: true },
    companyPhone        : { type: Number, trim: true },
    documentType        : { type: String, trim: true },
    documentNo          : { type: String, trim: true },
    ownerBVN            : { type: String, trim: true },
    gender              : { type: String, trim: true },

    certificate         : String,
    profile_pic         : String,
    address1: String,
    address2  : String,
    isVerified          : Number,
    profileComplete     : Number,
    creationDate        : Number,
    creationIp          : String,
    updateDate          : Number,
    updateIp            : String,
    status              : {
                            type: String,
                            enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
                            default: "A"
                          },
    token               : String, 
    latitude            : Number,
    longitude           : Number,
    device_id           : String,
    platform            : String,
    workers : [ { type: Schema.Types.ObjectId, ref: "dqw_providers" } ],
    
}, {timestamps: true});

module.exports = mongoose.model('dqw_providers', dqw_providers);
