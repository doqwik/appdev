const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_email_templates = new Schema({
  
    mail_type: { type: String, required: true, trim: true },
    from_email:  String,
    to_email:  String,
    bcc_email: String,
    subject: String,
    mail_header: String,
    mail_body: String,
    mail_footer : String,
    html : String,
    email_template_id : Number,
    creation_ip : String,
    creation_date : Number,
    created_by : Number,
    
    status: {
        type: String,
        enum: ["A","I","B","D"],            //A-Active, I-Inactive, B-Block, D-Delete
        default: "A"
    },

    update_date : Number,
    update_ip : String,
    updated_by : Number
}, {timestamps: true});

module.exports = mongoose.model('dqw_email_templates', dqw_email_templates);
