const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dqw_deleteRecords = new Schema({
    seq_id              : { type: Number, required: true, trim: true },
    table               : { type: String, required: true, trim: true },
    params              : { type: String, required: true, trim: true },
    creationDate        : Number,
    creationBy          : String,
    creationIp          : String,
    platform            : String,
    latitude            : String,
    longitude           : String    
}, {timestamps: true});

module.exports = mongoose.model('dqw_deleteRecords', dqw_deleteRecords);
