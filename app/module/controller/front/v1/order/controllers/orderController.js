const userService = require('../../../../../services/front/userService');
const providerService = require('../../../../../services/front/providerService');
const order = require('../../../../../services/front/orderplace');
const response = require('../../../../../../util/response');
const {writeLogErrorTrace} = require('../../../../../../util/logger');
const {isValidObjectId} = require('../../../../../../util/valueChecker');
const AuthToken = require("../../../../../../util/authToken");
const userCache = require("../../../../../../util/userCache");
const OtpGeneration = require("../../../../../../util/otpGeneration");
const OtpVerification = require("../../../../../../util/otpVerification");
const sha256 = require('sha256')
const moment = require("moment");
const _ = require("lodash");
const mongoose = require('mongoose'); 
const ObjectId = mongoose.Types.ObjectId;

  const {
    userAuthIssuerName,
    roles: { USER },
    authTokenUserAuthExpiresIn,
    userForgotPasswordPostFix,
    USERTYPE
  } = require("../../../../../../config/constant");
  

const path = require('path');
const fs = require('fs').promises;

/* ********************************************************************************
* Function Name   : slot_details
* For             : APP and Web
* Purposes        : This function is used to insert slot detail
* Creation Date   : 22-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.slot_details = async function (req, res) {
  try {
    const userId = req.user.userId;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    const {
      service_location,
      service_date,
      service_time,
      service_type,
      job_desc,
      latitude,
      longitude,
      device_id,
      worker_id,
      platform
    } = req.body;

    if (!service_location) {
      return response.sendResponse(res, response.build('SERVICE_LOCATION_EMPTY', {}));
    } else if (!service_date) {
      return response.sendResponse(res, response.build('SERVICE_DATE_EMPTY', {}));
    } else if (!service_time) {
      return response.sendResponse(res, response.build('SERVICE_TIME_EMPTY', {}));
    } else if (!service_type) {
      return response.sendResponse(res, response.build('SERVICE_TYPE_EMPTY', {}));
    } else if (!job_desc) {
      return response.sendResponse(res, response.build('JOB_DESC_EMPTY', {}));
    } else { 
      const where = { condition: { "_id": userId } };
     
      const isUserAvailable = await userService.getDataById(where);
      // Fetch service ID based on service type
      const where2 = { condition: { "service_name": service_type } };
      const serviceId = await order.getServiceByType(where2);
    
      const where5 = { condition: { "_id":worker_id} };

      const isUserAvailable5 = await providerService.getDataById(where5);
      if(!isUserAvailable5){
        return response.sendResponse(res, response.build('ERROR_INVALID_WORKER_ID', {}));
      }
      const where3 = {
        condition: {
          "user_id": isUserAvailable._id,
          "service_id": serviceId[0].service_id,
          "order_status": "Processing",
          "workers":worker_id
        }
      };
          
      const orderDetails = await order.getslotDetailByType(where3);
      const addData = {
        user_id: userId,
        user_seq_id: isUserAvailable.users_id,
        worker_id: isUserAvailable5._id,
        service_location,
        service_date,
        service_time,
        service_type,
        service_id: serviceId[0].service_id,
        job_desc,
        
        order_id: "", // Set to an empty string for now
        order_status: "Processing",
        ...(req.files.slot_pic ? { slot_pic: req.files.slot_pic[0].path } : {}),
        creationDate: new Date(),
        status: "A",
        ...(latitude ? { latitude } : {}),
        ...(longitude ? { longitude } : {}),
        ...(device_id ? { device_id } : {}),
        ...(platform ? { platform } : {})
      };
      if (orderDetails.length > 0 ) {
        const updatedOrder = await order.updateslotData(where3, addData);
        return response.sendResponse(res, response.build('SUCCESS', { result: updatedOrder._doc }));
      } else {
        const data = await order.createDataSlot(addData);
        return response.sendResponse(res, response.build('SUCCESS', { result: data._doc }));
      }
   
  }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
 //END OF FUNCTION

/* ********************************************************************************
* Function Name   : order_summary
* For             : APP and Web
* Purposes        : This function is used to insert order summary
* Creation Date   : 22-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.order_summary = async function (req, res) {
  try {
    const userId = req.user.userId;
    // console.log(userId);
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    const { slot_id, total_amount, discount, other_charge, amount_paid, coupon_code, latitude, longitude, device_id, platform, user_type, worker_id } = req.body;

    if (!slot_id) {
      return response.sendResponse(res, response.build('SLOT_ID_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } }

      const isUserAvailable = await userService.getDataById(where);
      const where2 = { condition: { "_id": slot_id, "worker_id": worker_id } }
      const isUserAvailable2 = await userService.getslotDataById(where2);

      const where22 = { condition: { "_id": worker_id } }
      const isUserAvailable22 = await providerService.getDataById(where22);


      let coupondiscount = 0; // Initialize the variable with 0

      if (coupon_code && coupon_code.length > 0) {
        const where5 = { condition: { "coupon_code": coupon_code } };
        const couponDetails = await order.getCouponDetail(where5);
        if (!couponDetails || couponDetails.length === 0) {
          return response.sendResponse(res, response.build('INVALID_COUPON_CODE', {}));
        }
        coupondiscount = couponDetails[0].discount;
        
      }
      const discountWithSign = coupondiscount + "%";
      let total_amount1 = "200";
     let amount_paid1 = total_amount1 - (total_amount1*coupondiscount)/100;
    let  discount1 = total_amount1*(coupondiscount/100);
      const addData = {
        user_id: userId,
        user_name: isUserAvailable.fullName,
        user_phone_no: isUserAvailable.phone,
        user_profile_pic: isUserAvailable.profile_pic,
        user_seq_id: isUserAvailable.users_id,
        worker_name: isUserAvailable22.fullName,
        worker_address: isUserAvailable22.address1,
        worker_pic: isUserAvailable22.profile_pic,
        service_location: isUserAvailable2[0].service_location,
        worker_id: isUserAvailable2[0].worker_id,
        service_date: isUserAvailable2[0].service_date,
        service_time: isUserAvailable2[0].service_time,
        service_type: isUserAvailable2[0].service_type,
        service_id: isUserAvailable2[0].service_id,
        job_desc: isUserAvailable2[0].job_desc,
        slot_pic: isUserAvailable2[0].slot_pic,
        slot_id: isUserAvailable2[0]._id,
        total_amount: total_amount1,
        discount: discountWithSign,
        discount_amount: discount1,
        other_charge: "0",
        amount_paid: amount_paid1,
        coupon: coupon_code,
        payment_type: '',
        order_otp: '',
        order_status: 'Processing',
        company_order_status: 'Assigned',
        creationDate: new Date(),
        status: "A",
        ...(latitude ? { latitude: latitude } : null),
        ...(longitude ? { longitude: longitude } : null),
        ...(device_id ? { device_id: device_id } : null),
        ...(platform ? { platform: platform } : null)
      };

      const orderDetails = await order.getslotDetailByType(where2);
      if (orderDetails.length > 0) {
        const data = await order.createDataOrder(addData);
        const update = {
          order_id: new ObjectId(data._id),
          order_status: "Processing"
        };
        const updatedOrder = await order.updateslotData(where2, update);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      } else {
        return response.sendResponse(res, response.build('ERROR_SLOT_DATA_NOT_FOUND', {}));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}
/* ********************************************************************************
* Function Name   : checkout
* For             : APP and Web
* Purposes        : This function is used to checkout
* Creation Date   : 27-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.checkout = async function (req, res) {
  try {
    const userId = req.user.userId;
    // console.log(userId);
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    const { payment_type, order_id } = req.body;

    if (!payment_type) {
      return response.sendResponse(res, response.build('PAYMENT_TYPE_EMPTY', {}));
    } if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } }
      const isUserAvailable = await userService.getDataById(where);

      // Fetch service ID based on service type
      const where2 = { condition: { "user_id": isUserAvailable._id, "_id": order_id } };
      const orderDetails = await order.getOrderDetailByType(where2);
      if (orderDetails) {
        const serviceId = orderDetails.service_id; // Retrieve the service ID from the order details
        const update = {
          payment_type: payment_type,
          order_otp: '123456',
          creationDate: new Date(),
          order_status: "Processing",
          service_id: serviceId // Include the retrieved service ID in the update data
        };
        const updatedOrder = await order.updateData(where2, update); // Update the order data with the new information

        const where3 = { 
          condition: { 
            "user_id": isUserAvailable._id, 
            "_id": updatedOrder.slot_id, 
            "service_id": updatedOrder.service_id, 
            "order_status": "Processing" 
          }
        };

        const updateslotdata = {
          order_status: "Processing"
        };
        const updatedslot = await order.updateslotData(where3, updateslotdata); 
        return response.sendResponse(res, response.build('SUCCESS', { result: updatedOrder }));
      } else {
        return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
      }

    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
}
//END OF FUNCTION
/* ********************************************************************************
* Function Name   : order_list
* For             : APP and Web
* Purposes        : This function is used to show user order
* Creation Date   : 27-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.order_list = async function (req, res) {
  try {
    const userId = req.user.userId;
    if (!userId || !isValidObjectId(userId)) {
      // Import and define the 'response' object and 'build' method appropriately.
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else {
      const where = { condition: { "_id": userId } };
        // Import and define the 'userService' object and 'getDataById' method appropriately.
        const isUserAvailable2 = await userService.getDataById(where);
        const where3 = { condition: { "user_id": isUserAvailable2._id } };
        // Import and define the 'order' object and 'getOrderDetailId' method appropriately.
        const orderDetails = await order.getOrderDetailId(where3);
        
        if (orderDetails.length > 0) {
          return response.sendResponse(res, response.build('SUCCESS', { result: orderDetails }));
        } else {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
    }
  } catch (error) {
    // Import and define the 'writeLogErrorTrace' method appropriately.
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    // Import and define the 'response' object and 'build' method appropriately.
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

 // END OF FUNCTION
/* ********************************************************************************
* Function Name   : reschedule_slot
* For             : APP and Web
* Purposes        : This function is used to reschedule slot
* Creation Date   : 03-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.reschedule_slot = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { slot_id,worker_id } = req.headers;
    const {service_location,service_date,service_time,service_type,job_desc,latitude,longitude,device_id,platform,} = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!service_location) {
      return response.sendResponse(res, response.build('SERVICE_LOCATION_EMPTY', {}));
    } else if (!service_date) {
      return response.sendResponse(res, response.build('SERVICE_DATE_EMPTY', {}));
    } else if (!service_time) {
      return response.sendResponse(res, response.build('SERVICE_TIME_EMPTY', {}));
    } else if (!service_type) {
      return response.sendResponse(res, response.build('SERVICE_TYPE_EMPTY', {}));
    } else if (!job_desc) {
      return response.sendResponse(res, response.build('JOB_DESC_EMPTY', {}));
    }else {
      const where = { condition: { "_id": userId } }
       
      const isUserAvailable = await userService.getDataById(where);
      const where2 = { condition: { "user_id": userId , "_id" :slot_id ,"worker_id":worker_id,"order_status": "Processing"  } }
      // console.log(where2);
      const isUserAvailable2 = await order.getslotDataById(where2);

      const where3 = { condition: { "service_name": service_type } };
      const serviceId = await order.getServiceByType(where3);
      
      const where4 = { condition: { "user_id": userId, "slot_id" :slot_id ,"worker_id":worker_id,"order_status": "Processing"  } }

      // console.log(isUserAvailable2);
            if (isUserAvailable2) {
              const update = {
                 
                  service_location:service_location,
                  service_date:service_date,
                  service_time:service_time,
                  service_type:service_type,
                  service_id: serviceId.service_id,
                  job_desc:job_desc
                 
                };
                console.log('updateData', update);

                const updatedOrder = await order.updateslotData(where2, update);
                const updatedOrderdata = await order.updateData(where4, update);
                console.log('updatedOrder',updatedOrder)
                console.log('updatedOrderdata',updatedOrderdata)
              return response.sendResponse(res, response.build('SUCCESS', { result: updatedOrder }));
            } else {
              return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
            }
          
  }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : cancel_order
* For             : APP and Web
* Purposes        : This function is used to cancel order
* Creation Date   : 03-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.cancel_order = async function (req, res) {
  try {
    const userId = req.user.userId;
    //const { order_id} = req.headers;
    const {order_status, cancel_reason,order_id} = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!cancel_reason) {
      return response.sendResponse(res, response.build('CANCEL_REASON_EMPTY', {}));
    }else if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    }else {
      const where = { condition: { "_id": userId } }
      const isUserAvailable = await userService.getDataById(where);
      const where2 = { condition: { "user_id": isUserAvailable._id,"_id":order_id } }
      const isUserAvailable2 = await order.getorderDataById(where2);
      const where3 = { condition: { "order_id":order_id } }
       if (isUserAvailable2) {
              const update = {
                order_status:"Cancel",
                cancel_reason:cancel_reason,
                 };
              const updatedOrder = await order.updateorderData(where2, update);
              const updateslot = await order.updateslotData(where3, update);
              return response.sendResponse(res, response.build('SUCCESS', { result: updatedOrder }));
        } else {
              return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
          
  }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : order_complete
* For             : APP and Web
* Purposes        : This function is used to complete order 
* Creation Date   : 06-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.order_complete = async function (req, res) {
  try {
    const userId = req.user.userId;
    // console.log(userId);
    const {order_id,order_status} = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    }else if (!order_status) {
      return response.sendResponse(res, response.build('ORDER_STATUS_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } }
        const isUserAvailable = await providerService.getDataById(where);
        if(isUserAvailable.workers!=""){
          const workerIds = isUserAvailable.workers; 
          let where1 = {
            condition: { "worker_id": { $in: workerIds },"_id": order_id }
          };
          const isUserAvailable2 = await order.getOrderDetailByType(where1);
          if (isUserAvailable2.length > 0) {
            const updateData = {
              order_status:"Completed"
            };
            let where2 = {
              condition: { "order_id": order_id }
            };
            const orderDetails = await order.getslotDetailByType(where2);
            if (orderDetails.length > 0) {
                const update = {
                  order_status:"Completed"
                  };
                const updatedOrder = await order.updateslotData(where2, update); 
                const orderComplete = await order.updateData(where1,updateData);
                return response.sendResponse(res, response.build('SUCCESS', { result: orderComplete }));
              } else {
              return response.sendResponse(res, response.build('ERROR_SLOT_DATA_NOT_FOUND', {}));
            }
           

          }else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
        }else{
          let where1 = {
            condition: { "worker_id":isUserAvailable._id,"_id": order_id }
          };
          const isUserAvailable2 = await order.getOrderDetailByType(where1);
          if (isUserAvailable2.length > 0) {
            const updateData = {
              order_status
            };
            let where2 = {
              condition: { "order_id": order_id }
            };
            const orderDetails = await order.getslotDetailByType(where2);
            if (orderDetails.length > 0) {
                const update = {
                  order_status:"Completed"
                  };
                const updatedOrder = await order.updateslotData(where2, update); 
                const orderComplete = await order.updateData(where1,updateData);
                return response.sendResponse(res, response.build('SUCCESS', { result: orderComplete }));
              } else {
              return response.sendResponse(res, response.build('ERROR_SLOT_DATA_NOT_FOUND', {}));
            }
           

          }else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
        }
  }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : coupon_code
* For             : APP and Web
* Purposes        : This function is used to insert coupon code
* Creation Date   : 10-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.coupon_code = async function (req, res) {
  try {
   
    const {coupon_code,discount} = req.body;

   if (!coupon_code) {
      return response.sendResponse(res, response.build('COUPON_CODE_EMPTY', {}));
    }else  if (!discount) {
      return response.sendResponse(res, response.build('DISCOUNT_EMPTY', {}));
    }  else {
     
      const addData = {
        coupon_code: coupon_code,
        discount:discount,
        creationDate: new Date(),
        status: "A"
        };
        const where3 = { condition: { "coupon_code": coupon_code } };
        const couponDetails = await order.getCouponDetail(where3);
        if(couponDetails > 0){
        const couponData = await order.createCouponData(addData);
        return response.sendResponse(res, response.build('SUCCESS', { result: couponData._doc }));
        }else{
          return response.sendResponse(res, response.build('SUCCESS', { result: {'message' : coupon_code+" is already inserted."} }));
        }
  }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : apply_coupon_code
* For             : APP and Web
* Purposes        : This function is used to apply coupon code
* Creation Date   : 10-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.apply_coupon_code = async function (req, res) {
  try {
    const userId = req.user.userId;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }

    const { coupon_code } = req.body;

    if (!coupon_code) {
      return response.sendResponse(res, response.build('COUPON_CODE_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } };
      const isUserAvailable = await userService.getDataById(where);

      if (!isUserAvailable) {
        return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
      }

      const where2 = { condition: { "user_id": userId ,"order_status":"Processing"} };
      const isUserAvailable2 = await order.getOrderDetailId(where2);
    
      if (!isUserAvailable2) {
        return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
      }
      const where3 = { condition: { "coupon_code": coupon_code } };
      const couponDetails = await order.getCouponDetail(where3);
      if (!couponDetails || couponDetails.length === 0 ) {
        return response.sendResponse(res, response.build('INVALID_COUPON_CODE', {}));
      }
      let totalAmount = isUserAvailable2[0].total_amount; 
      let coupondiscount= couponDetails[0].discount;
      const discountAmount = ( coupondiscount/ 100) * totalAmount;

      const finalAmount = totalAmount - discountAmount;

      const update = {
        discount: coupondiscount,
        coupon: coupon_code,
      };
      const updatedOrder = await order.updateData(where2, update); 
      return response.sendResponse(res, response.build('SUCCESS', { result: updatedOrder }));
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : order_detail
* For             : APP and Web
* Purposes        : This function is used to show all order detail (latest , today , completed)
* Creation Date   : 11-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.order_detail = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { order_search } = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!order_search) {
      return response.sendResponse(res, response.build('ORDER_SEARCH_EMPTY', {}));
    }else{ 
    const where = { condition: { "_id": userId } }
    const isUserAvailable = await providerService.getDataById(where);
    if (isUserAvailable.workers !== null && isUserAvailable.workers !== "" && isUserAvailable.userType !== "Worker") {
      const workerIds = isUserAvailable.workers; 
      const where1 = {
        condition: { "worker_id": { $in: workerIds }}
      };
      let workers = await order.getOrderDetailByType(where1);
      if (order_search === 'Latest') {
        const today1 = new Date();
        const year = today1.getFullYear();
        const month = String(today1.getMonth() + 1).padStart(2, '0');
        const day = String(today1.getDate()).padStart(2, '0');
        const dateString = `${day}-${month}-${year}`;
        workers.sort((a, b) => {
          const timestampA = a.service_date;
          const timestampB = b.service_date;
          if (timestampA === timestampB) {
            return 0;
          }
          if (timestampA === dateString) {
            return -1;
          }
          if (timestampB === dateString) {
            return 1;
          }
          return timestampB.localeCompare(timestampA);
        });
      }else if(order_search === 'Completed'){
        workers = workers.filter(worker => worker.finish_job === 'Finish');
      }else if (order_search === 'Assigned') {
  workers = workers.filter(worker => 
    worker.company_order_status === 'Assigned');
}
else if(order_search === 'Reject'){
          workers = workers.filter(worker => worker.order_status === 'Cancel' && worker.worker_order_status === 'Reject');

        }
      if (workers.length > 0) {
        return response.sendResponse(res, response.build('SUCCESS', { result: workers }));
      } else {
        return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
      }
    }else{
        const where3 = { condition: { "worker_id": isUserAvailable._id } }
        let workers = await order.getOrderDetailByType(where3);
        if (order_search === 'Latest') {
          const today1 = new Date();
          const year = today1.getFullYear();
          const month = String(today1.getMonth() + 1).padStart(2, '0');
          const day = String(today1.getDate()).padStart(2, '0');
          const dateString = `${day}-${month}-${year}`;
          workers.sort((a, b) => {
            const timestampA = a.service_date;
            const timestampB = b.service_date;
            if (timestampA === timestampB) {
              return 0;
            }
            if (timestampA === dateString) {
              return -1;
            }
            if (timestampB === dateString) {
              return 1;
            }
            return timestampB.localeCompare(timestampA);
          });
        }else if(order_search === 'Today'){
          const today1 = new Date();
          const year = today1.getFullYear();
          const month = String(today1.getMonth() + 1).padStart(2, '0');
          const day = String(today1.getDate()).padStart(2, '0');
          const dateString = `${day}-${month}-${year}`;
          
          workers = workers.filter(worker => {
            const timestamp = worker.service_date;
            const [workerDay, workerMonth, workerYear] = timestamp.split('-');
            const formattedDate = `${workerDay}-${workerMonth}-${workerYear}`;
            return formattedDate === dateString;
          });
          
        }else if(order_search === 'Completed'){
          workers = workers.filter(worker => worker.finish_job === 'Finish');
        }else if(order_search === 'Reject'){
          workers = workers.filter(worker => worker.order_status === 'Cancel' && worker.worker_order_status === 'Reject');

        }
        if (workers.length > 0) { 
          return response.sendResponse(res, response.build('SUCCESS', { result: workers }));
        } else {
          return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
        }
    }
  }
  } catch (error) {
    console.error('[workers registration]', '[controller] Error:', error);
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : order_accept
* For             : APP and Web
* Purposes        : This function is used to accept order 
* Creation Date   : 11-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.order_accept = async function (req, res) {
  try {
    const userId = req.user.userId;
    const {order_id,order_status} = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    }else if (!order_status) {
      return response.sendResponse(res, response.build('ORDER_STATUS_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } }
        const isUserAvailable = await providerService.getDataById(where);
          let where1 = {
            condition: { "worker_id":isUserAvailable._id,"_id": order_id }
          };
          const isUserAvailable2 = await order.getOrderDetailByType(where1);
          if (isUserAvailable2.length > 0) {
            const updateData = {
              worker_order_status:"Accepted"
            };
            const orderComplete = await order.updateData(where1,updateData);
            return response.sendResponse(res, response.build('SUCCESS', { result: orderComplete }));
          }else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
  }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : order_reject
* For             : APP and Web
* Purposes        : This function is used to reject order 
* Creation Date   : 11-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.order_reject = async function (req, res) {
  try {
    const userId = req.user.userId;
    const {order_id,order_status,reject_reason} = req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    }else if (!order_status) {
      return response.sendResponse(res, response.build('ORDER_STATUS_EMPTY', {}));
    }else if (!reject_reason) {
      return response.sendResponse(res, response.build('CANCEL_REASON_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } }
        const isUserAvailable = await providerService.getDataById(where);
          let where1 = {
            condition: { "_id": order_id }
          };
          const isUserAvailable2 = await order.getOrderDetailByType(where1);
          if (isUserAvailable2.length > 0) {
            const updateData = {
              worker_order_status:"Reject",
              company_order_status:"Reject",
              order_status:"Cancel",
              cancel_reason:reject_reason
            };
            const orderComplete = await order.updateData(where1,updateData);
            return response.sendResponse(res, response.build('SUCCESS', { result: orderComplete }));
          }else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
  }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
} //END OF FUNCTION
/* ********************************************************************************
* Function Name   : assign_order
* For             : APP and Web
* Purposes        : This function is used to assign order to worker
* Creation Date   : 12-07-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.assign_order = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { order_id, worker_id,order_status } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    }else if (!order_status) {
      return response.sendResponse(res, response.build('ORDER_STATUS_EMPTY', {}));
    } else if (!worker_id) {
      return response.sendResponse(res, response.build('WORKER_ID_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } };
      const providerData = await providerService.getDataById(where);
          if (!providerData) {
            return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
          }
          const where3 = { condition: { worker_id: providerData.workers,_id : order_id , worker_id : worker_id } };
          const orderData = await order.getOrderDetailByType(where3);
          if(orderData.length > 0){
              const updateData = {
                company_order_status:"Assigned"
              };
            const assignOrderData = await  order.updateData(where3,updateData);
            return response.sendResponse(res, response.build('SUCCESS', { result: assignOrderData }));
          }else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : job_start
* For             : APP and Web
* Purposes        : This function is used to start job
* Creation Date   : 12-07-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.job_start = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { order_id,start_job } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    }else if (!start_job) {
      return response.sendResponse(res, response.build('START_JOB_EMPTY', {}));
    } else {
      const where = { condition: { "_id": userId } };
      const providerData = await providerService.getDataById(where);
          if (!providerData) {
            return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
          }
          const where3 = { condition: { worker_id: providerData._id,_id : order_id,company_order_status:"Assigned" } };
          const orderData = await order.getOrderDetailByType(where3);
          if(orderData.length > 0){
              const updateData = {
                start_job:"Start",
                worker_order_status :"Started"
              };
            const startJonData = await  order.updateData(where3,updateData);
            return response.sendResponse(res, response.build('SUCCESS', { result: startJonData }));
          }else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
/* ********************************************************************************
* Function Name   : job_finish
* For             : APP and Web
* Purposes        : This function is used to finish job
* Creation Date   : 12-07-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.job_finish = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { order_id,finish_job, job_location,code,latitude,longitude,device_id,platform } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }else if (!order_id) {
      return response.sendResponse(res, response.build('ORDER_ID_EMPTY', {}));
    }else if (!finish_job) {
      return response.sendResponse(res, response.build('FINISH_JOB_EMPTY', {}));
    } else if (!job_location) {
      return response.sendResponse(res, response.build('JOB_LOCATION_EMPTY', {}));
    } else if (!code) {
      return response.sendResponse(res, response.build('CODE_EMPTY', {}));
    }  else if (!req.files || (!req.files.job_first_pic && !req.files.job_second_pic)) {
      return response.sendResponse(res, response.build('JOB_PIC_EMPTY', {}));
    }else {
      const where = { condition: { "_id": userId } };
      const providerData = await providerService.getDataById(where);
          if (!providerData) {
            return response.sendResponse(res, response.build('ERROR_USER_NOT_FOUND', {}));
          }
         
          const where3 = { condition: { worker_id: providerData._id,_id : order_id ,start_job:"Start"} };
          const orderData = await order.getOrderDetailByType(where3);
          if(orderData.length > 0){
              if(orderData[0].order_otp === code ){
                const updateData = {
                  finish_job:"Finish",
                   worker_order_status :"Completed",
                  job_location:job_location,
                  job_code:code,
                  ...(req.files.job_first_pic ? { job_first_pic: req.files.job_first_pic[0].path } : {}),
                  ...(req.files.job_second_pic ? { job_second_pic: req.files.job_second_pic[0].path } : {}),
                 
                  worker_latitude: latitude,
                  worker_longitude: longitude,
                  worker_device_id: device_id,
                  worker_platform: platform
                };
                
              const startJonData = await  order.updateData(where3,updateData);
              return response.sendResponse(res, response.build('SUCCESS', { result: startJonData }));
              }else {
                return response.sendResponse(res, response.build('ERROR_CODE_NOT_FOUND', {}));
              }
          }else {
            return response.sendResponse(res, response.build('ERROR_DATA_NOT_FOUND', {}));
          }
    }
  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

/* ********************************************************************************
* Function Name   : paystackCallback
* For             : APP and Web
* Purposes        : This function is used to finish job
* Creation Date   : 12-07-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.paystackCallback = async function (req, res) {
  try {
    const { body } = req;
    console.log(body);
    return response.sendResponse(res, response.build('SUCCESS', {  }));

  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};

/* ********************************************************************************
* Function Name   : paystackCallback
* For             : APP and Web
* Purposes        : This function is used to finish job
* Creation Date   : 12-07-2023
* Created By      : Megha Kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.webhookCallback = async function (req, res) {
  try {
    const { body } = req;
    console.log(body);
    return response.sendResponse(res, response.build('SUCCESS', {  }));

  } catch (error) {
    writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
  }
};
