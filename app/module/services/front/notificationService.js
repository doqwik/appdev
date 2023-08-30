const User = require('./userService');
const Provider = require("../../services/front/providerService");
const Notification = require("../../../models/notificationDetails");
const notifyLog = require("../../../models/notificationLog");
const { NOTIFICATIONKEY } = require('../../../config/constant');
const Counter = require("../../services/front/counterService");

const request = require('request');


/************************************************************
 * Function Name    : getData
 * Purpose          : This function is used for notification
 * Created Date     : 25-08-2023
*************************************************************/
exports.getData = async function (options,type) {
    try {
        const { condition={}, sort={},skip,limit } = options;
        if(type == 'count'){
        return await Notification.find(condition).count();
        } else {
        return await Notification.find(condition).sort(sort).skip(skip).limit(limit);
        }
    } catch (error) {
        return Promise.reject(error);
    }   
}//End of function

/************************************************************
 * Function Name    : createData
 * Purpose          : This function is used for add new entry notification
 * Created Date     : 25-08-2023
*************************************************************/
exports.createData = async function (options) {
    try {
        return await Notification.create(options);
    } catch (error) {
        return Promise.reject(error);
    }   
}//End of function

/************************************************************
 * Function Name    : createLog
 * Purpose          : This function is used for add new entry notification
 * Created Date     : 25-08-2023
*************************************************************/
const createLog = async function (options) {
    try {
        return await notifyLog.create(options);
    } catch (error) {
        return Promise.reject(error);
    }   
}//End of function

function sendNotificationToAllUsers(notificationIDs = '', message = '', data = {}) {
    if (notificationIDs && message && Object.keys(data).length) {
        const fields = {
            to: notificationIDs,
            notification: {
                title: data.notification,
                body: message
            },
            data: data
        };
        const headers = {
            'Authorization': 'key='+NOTIFICATIONKEY,
            'Content-Type': 'application/json'
        };

        const options = {
            url: 'https://fcm.googleapis.com/fcm/send',
            method: 'POST',
            headers: headers,
            json: true,
            body: fields
        };

        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    }
}

/************************************************************
 * Function Name    : sendWelcomeNotification
 * Purpose          : This function is used for send welcome notification to new user
 * Created Date     : 25-08-2023
*************************************************************/
exports.sendWelcomeNotification = async function (userId){
    try {
        if(userId){
            const where ={
                condition : { _id : userId },
                select : { device_id : true, users_id : true }
            }
            let userData = await User.getDataById(where);
            const deviceID  = userData.device_id;
            const message   = 'Welcome to Doqwik';
            const title     =  "Welcome to Doqwik";
            const data = { notification: title, message: message };
            
            sendNotificationToAllUsers(deviceID, message, data)
            .then(async result => {
                const addData = {
                    user_id     : userData.users_id,
                    title       : title,
                    respounse   : JSON.stringify(result),
                    status      : 'Success',
                    creationDate : new Date()
                }
                createLog(addData)
                // console.log('Notification sent:', result);
            })
            .catch(error => {
                const addData = {
                    user_id     : userData._id?userData._id:"",
                    title       : title?title:"",
                    respounse   : JSON.stringify(error),
                    status      : 'Fail',
                    creationDate : new Date()
                }
                createLog(addData)
                // console.error('Error sending notification:', error);
            });
        }   
    } catch (error) {
        return true;
    }    
} //End of Function
/************************************************************
 * Function Name    : newJobNotificationtouser
 * Purpose          : This function is used for send new order notity to user
 * Created Date     : 25-08-2023
*************************************************************/
exports.newJobNotificationtouser = async function (options){
    try {
        const { userId, service, sub_service } = options;
        if(userId){
            const where ={
                condition : { _id : userId },
                select : { device_id : true, users_id : true }
            }
            let userData = await User.getDataById(where);
            if(userData && userData.device_id){
                const deviceID  = userData.device_id;
                const message   = "Your order has been placed for service "+service+", "+sub_service+". Please wait for the provider to accept the order service";
                const title     =  'New order placed.';
                const data = { notification: title, message: message };
                
                sendNotificationToAllUsers(deviceID, message, data)
                .then(async result => {
                    const addData = {
                        user_id     : userData._id,
                        title       : title,
                        respounse   : JSON.stringify(result),
                        status      : 'Success',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.log('Notification sent:', result);
                })
                .catch(error => {
                    const addData = {
                        user_id     : userData._id?userData._id:"",
                        title       : title?title:"",
                        respounse   : JSON.stringify(error),
                        status      : 'Fail',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.error('Error sending notification:', error);
                });
            } else{
                const addData = {
                    user_id     : userData._id?userData._id:"",
                    title       : title?title:"",
                    respounse   : "user/device id not found",
                    status      : 'Fail',
                    creationDate : new Date()
                }
                createLog(addData)
                console.log('fail')
            }
        }   
    } catch (error) {
        return true;
    }    
} //End of Function

/************************************************************
 * Function Name    : newJobNotificationtoprovider
 * Purpose          : This function is used for send new order notity to user
 * Created Date     : 25-08-2023
*************************************************************/
exports.newJobNotificationtoprovider = async function (options){
    try {
        const { providerData, service, sub_service } = options;
        if(providerData){
            const where ={
                condition : { _id : providerData },
                select : { device_id : true }
            }
            let userData = await Provider.getDataById(where);
            // console.log('provider_d_id',userData);
            if(userData && userData.device_id){
                const deviceID  = userData.device_id;
                const message   = "Request for service "+service+", "+sub_service+". Please accept the order service.";
                const title     =  'New order request.';
                const data = { notification: title, message: message };
                
                sendNotificationToAllUsers(deviceID, message, data)
                .then(async result => {
                    const addData = {
                        user_id     : userData._id,
                        title       : title,
                        respounse   : JSON.stringify(result),
                        status      : 'Success',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.log('Notification sent:', result);
                })
                .catch(error => {
                    const addData = {
                        user_id     : userData._id?userData._id:"",
                        title       : title?title:"",
                        respounse   : JSON.stringify(error),
                        status      : 'Fail',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.error('Error sending notification:', error);
                });
            } else{
                const addData = {
                    user_id     : userData._id?userData._id:"",
                    title       : title?title:"",
                    respounse   : "user/device id not found",
                    status      : 'Fail',
                    creationDate : new Date()
                }
                createLog(addData)
                console.log('fail')
            }
        }   
    } catch (error) {
        return true;
    }    
} //End of Function

/************************************************************
 * Function Name    : newJobNotificationtoprovider
 * Purpose          : This function is used for send new order notity to user
 * Created Date     : 25-08-2023
*************************************************************/
exports.jobAcceptNotyfy = async function (options){
    try {
        const { userId, service, sub_service, date, time } = options;
        // const dateObj = new Date(`1970-01-01T${time}`);
        // const formattedTime = dateObj.toLocaleTimeString('en-US', {
        //     hour: 'numeric',
        //     minute: 'numeric',
        //     hour12: true
        // });
        // console.log('time',formattedTime);
        if(userId){
            const where ={
                condition : { _id : userId },
                select : { device_id : true }
            }
            let userData = await User.getDataById(where);
            console.log('provider_d_id',userData);
            if(userData && userData.device_id){
                const deviceID  = userData.device_id;
                const message   = "Your order for service "+service+", "+sub_service+" at "+date+" accepted by service provider at DoQwik.";
                const title     =  'Your order is accepted at DoQwik .';
                const data = { notification: title, message: message };
                
                sendNotificationToAllUsers(deviceID, message, data)
                .then(async result => {
                    const addData = {
                        user_id     : userData._id,
                        title       : title,
                        respounse   : JSON.stringify(result),
                        status      : 'Success',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.log('Notification sent:', result);
                })
                .catch(error => {
                    const addData = {
                        user_id     : userData._id?userData._id:"",
                        title       : title?title:"",
                        respounse   : JSON.stringify(error),
                        status      : 'Fail',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.error('Error sending notification:', error);
                });
            } else{
                const addData = {
                    user_id     : userData._id?userData._id:"",
                    title       : title?title:"",
                    respounse   : "user/device id not found",
                    status      : 'Fail',
                    creationDate : new Date()
                }
                createLog(addData)
                console.log('fail')
            }
        }   
    } catch (error) {
        return true;
    }    
} //End of Function

/************************************************************
 * Function Name    : jobStartNotyfy
 * Purpose          : This function is used for send new order notity to user
 * Created Date     : 25-08-2023
*************************************************************/
exports.jobStartNotyfy = async function (options){
    try {
        const { userId, service, sub_service, date, time } = options;
        if(userId){
            const where ={
                condition : { _id : userId },
                select : { device_id : true }
            }
            let userData = await User.getDataById(where);
            if(userData && userData.device_id){
                const deviceID  = userData.device_id;
                const message   = "Your order for service "+service+", "+sub_service+" at "+date+" start by service provider.";
                const title     =  'Your service is started.';
                const data = { notification: title, message: message };
                
                sendNotificationToAllUsers(deviceID, message, data)
                .then(async result => {
                    const addData = {
                        user_id     : userData._id,
                        title       : title,
                        respounse   : JSON.stringify(result),
                        status      : 'Success',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.log('Notification sent:', result);
                })
                .catch(error => {
                    const addData = {
                        user_id     : userData._id?userData._id:"",
                        title       : title?title:"",
                        respounse   : JSON.stringify(error),
                        status      : 'Fail',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.error('Error sending notification:', error);
                });
            } else{
                const addData = {
                    user_id     : userData._id?userData._id:"",
                    title       : title?title:"",
                    respounse   : "user/device id not found",
                    status      : 'Fail',
                    creationDate : new Date()
                }
                createLog(addData)
                console.log('fail')
            }
        }   
    } catch (error) {
        return true;
    }    
} //End of Function
/************************************************************
 * Function Name    : jobStartNotyfy
 * Purpose          : This function is used for send new order notity to user
 * Created Date     : 25-08-2023
*************************************************************/
exports.jobFinishNotyfy = async function (options){
    try {
        const { userId, service, sub_service, date, time } = options;
        if(userId){
            const where ={
                condition : { _id : userId },
                select : { device_id : true }
            }
            let userData = await User.getDataById(where);
            if(userData && userData.device_id){
                const deviceID  = userData.device_id;
                const message   = "Your order for service "+service+", "+sub_service+" at "+date+" is completed by service provider.";
                const title     =  'Your requested service is completed.';
                const data = { notification: title, message: message };
                
                sendNotificationToAllUsers(deviceID, message, data)
                .then(async result => {
                    const addData = {
                        user_id     : userData._id,
                        title       : title,
                        respounse   : JSON.stringify(result),
                        status      : 'Success',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.log('Notification sent:', result);
                })
                .catch(error => {
                    const addData = {
                        user_id     : userData._id?userData._id:"",
                        title       : title?title:"",
                        respounse   : JSON.stringify(error),
                        status      : 'Fail',
                        creationDate : new Date()
                    }
                    createLog(addData)
                    console.error('Error sending notification:', error);
                });
            } else{
                const addData = {
                    user_id     : userData._id?userData._id:"",
                    title       : title?title:"",
                    respounse   : "user/device id not found",
                    status      : 'Fail',
                    creationDate : new Date()
                }
                createLog(addData)
                console.log('fail')
            }
        }   
    } catch (error) {
        return true;
    }    
} //End of Function

