const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_jobs = new Schema({
    job_id              : { type: Number,required: true, trim: true },
    user_id             : { type: Schema.Types.ObjectId,required: true, ref: "dqw_users" },
    user_seq_id         : { type: Number, trim: true },
    providerData        : { type: Schema.Types.ObjectId,required: true, ref: "dqw_providers" },
    providerUserType    : String,  
    workerData          : { type: Schema.Types.ObjectId, ref: "dqw_providers" },
    provider_seq_id     : { type: Number, trim: true },
    service_type        : { type: Schema.Types.ObjectId,required: true, ref: "dqw_provider_sub_services" },
    service_name        : { type: String, required: true, trim: true },
    sub_service_name    : { type: String, required: true, trim: true },
    
    amount              : { type: Number, required: true, trim: true },
    paidAmount          : { type: Number, trim: true },
    discount            : { type: Number, trim: true },  
    otherCharges        : { type: Number, trim: true },
    finalPaidAmount     : { type: Number, trim: true },
    
    service_location    : { type: Schema.Types.ObjectId,required: true, ref: "dqw_addresses" },
    service_date        : { type: String, required: true, trim: true },
    service_time        : { type: String, required: true, trim: true },
    job_desc            : { type: String,required: true, trim: true },
    paymentType         : { type: String, trim: true },    //Prepaid, Postpaid
    paymentMode         : { type: String, trim: true },    //Cash, Online
    paymentStatus       : { type: String,required: true, trim: true },  //Initialized, Success, Fail, Cancel
    revenue_percentage  : Number,
    revenue_amount      : Number,
    txn_no              : String,
    isCouponUse         : String, 
    couponCode          : String,
    job_status          : String,  //placed,assign,reject,accept,complet    
    jobImage            : String,
    verificationCode    : Number,

    jobAcceptAt         : Number,

    jobRejectAt         : Number,
    jobRejectReason     : String,
    jobRejectBy         : String,

    
    jobStartAt          : Number,
    jobStartImage1      : { type: String, trim: true },
    jobStartImage2      : { type: String, trim: true },
    jobStartLatitude    : Number,
    jobStartLongitude   : Number,

    jobFinishAt         : Number,
    
    jobRescheduleby     : String,
    jobRescheduleAt     : Number,

    userFeedback        : {
                            star : Number,
                            message : String,
                            feedbackAt : Number,
                            reply   : String,
                            replayAt : Number
                        },

    createdBy           : String,
    creationDate        : Number,
    creationIp          : String,
    updateDate          : Number,
    updateIp            : String,
    latitude            : Number,
    longitude           : Number,
    platform            : String            //Android, IOS, WEB
}, {timestamps: true});

module.exports = mongoose.model('dqw_jobs', dqw_jobs);
