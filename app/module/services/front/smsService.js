const { SMSKEY } = require("../../../config/constant");
const { createSMSLog } =require("../../services/front/commonService");
/*************************************
 * Sent Message Function
 *************************************/
 async function sentMessage(data) { 
    var request = require('request');
    var options = {
    'method': 'POST',
    'url': 'https://api.ng.termii.com/api/sms/send',
    'headers': {
    'Content-Type': ['application/json', 'application/json']
    },
    body: JSON.stringify(data)

    };
    return new Promise ((resolev, reject) => {
        request(options, function (error, response) { 
        if (error){
            console.log('error',error)
            reject(error);
        } else{
            console.log(response.body);
            resolev(JSON.stringify(response.body));
        }
        });  
    })
}
/*******************************************
 ** Function Name       :   sentLoginOTP
 ** Date                :   22-08-2023
 ******************************************/
exports.sentLoginOTP = async function (options) { 
    var data = {
        "to": "234"+options.phone.toString(),
        "from":"Login",
        "sms":"Your DoQwik confirmation code is "+options.code+". It expires in 10 minutes.",
        "type":"plain",
        "api_key": SMSKEY.toString(),
        "channel":"dnd"
    };
    console.log('data',data)
    return new Promise (async (resolev, reject)=>{
        await sentMessage(data)
        .then( result => {
            const log = {
                phone : options.phone,
                respounse : JSON.stringify(result)
            }
            createSMSLog(log);
            resolev(true)
        });
    })
}
