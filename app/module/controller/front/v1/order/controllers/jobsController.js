const userService = require('../../../../../services/front/userService');
const providerService = require('../../../../../services/front/providerService');
const jobs = require('../../../../../services/front/jobServices');
const response = require('../../../../../../util/response');
const {writeLogErrorTrace} = require('../../../../../../util/logger');
const {isValidObjectId} = require('../../../../../../util/valueChecker');
const Counter = require('../../../../../services/front/counterService');
const Notification =require("../../../../../services/front/notificationService");


const sha256 = require('sha256')
const moment = require("moment");
const _ = require("lodash");
const mongoose = require('mongoose'); 
const ObjectId = mongoose.Types.ObjectId;
  const {
    USERTYPE,
    JOBSTATUS,
    PAYMENTSTATUS
  } = require("../../../../../../config/constant");

const path = require('path');
const fs = require('fs').promises;

/* ********************************************************************************
* Function Name   : assignJob
* For             : APP and Web
* Purposes        : This function is used to assign jot by user
* Creation Date   : 26-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.assignJob = async function (req, res) {
  try {
    const userId = req.user.userId;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    const { service_location, service_date, service_time, service_type, job_desc, latitude, longitude, provider_id, platform, ipAddress} = req.body;
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
    } else if (!provider_id) {
      return response.sendResponse(res, response.build('PROVIDER_EMPTY', {}));
    } else if (!platform) {
      return response.sendResponse(res, response.build('PLATFORM_EMPTY', {}));
    } else if (!ipAddress) {
      return response.sendResponse(res, response.build('IPADDRESS_EMPTY', {}));
    } else { 
      if(!isValidObjectId(service_location)){
        return response.sendResponse(res, response.build('SERVICE_LOCATION_NOT_FOUND',{}))
      }
      let locationWhere = {
        condition : { _id : service_location, user_id : userId }
      }
      let checkLocation = await userService.getAddressDataById(locationWhere)
      if(checkLocation && checkLocation.length === 0){
        return response.sendResponse(res, response.build('SERVICE_LOCATION_NOT_FOUND',{}))
      }
      let where = { 
        condition: { "_id": userId },
        select : { fullName : true, users_id : true }
      };
      let userData = await userService.getDataById(where);
      // return response.sendResponse(res, response.build('SUCCESS', { result: userData }));

      if(!isValidObjectId(service_type)){
        return response.sendResponse(res, response.build('WRONG_SERVICE_TYPE', {}));
      }
      // Fetch service ID based on service type
      let where2 = { condition: { "_id": service_type } };
      let  serviceData = await providerService.getOnlyOneIndividualServices(where2);
      console.log('serviceData',serviceData)
      console.log('revenue', serviceData.subServices.revenue);
      if(!serviceData){
        return response.sendResponse(res, response.build('WRONG_SERVICE_TYPE', {}));
      }
      let where5 = { condition: { "_id":provider_id, "status" : "A" }, select : { fullName : true, status : true, seq_id : true, userType : true } };
      let providerData = await providerService.getDataById(where5);
      if(!providerData){
        return response.sendResponse(res, response.build('WRONG_PROVIDER_ID', {}));
      }
      // return response.sendResponse(res, response.build('SUCCESS', { result: providerData }));
      
      let where3 = {
        condition: {
          "user_id"       : userData._id,
          "providerData"  : providerData._id,
          "job_status"    : JOBSTATUS.PROCESSING,
          "service_type"  : service_type,
          "service_date"  : service_date,
          "service_time"  : service_time
        }
      };
      let orderDetails = await jobs.getOnlyOneData(where3);
      if(orderDetails){
        return response.sendResponse(res, response.build('SUCCESS', { 'message' : 'Duplicate Order', result: orderDetails }));
      } else{
        const seq_id = await Counter.getSequence('dqw_users');
        // const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        const code = 123456;
        const addData = {
          job_id : seq_id,
          user_id: userData._id,
          user_seq_id: userData.users_id || '',
          providerData: providerData._id,
          providerUserType : providerData.userType,
          provider_seq_id : providerData.seq_id || '',
          service_type : service_type,
          service_name : serviceData.serviceData.service_name,
          sub_service_name : serviceData.subServices.sub_service_name,
          revenue_percentage : serviceData.subServices.revenue? parseFloat(serviceData.subServices.revenue):0,
          // ...(serviceData.subServices.revenue?{revenue_percentage : serviceData.subServices.revenue}:0),
          amount : serviceData.price,
          paidAmount : serviceData.price,
          discount : 0,
          otherCharges : 0,
          service_location : service_location,
          service_date : service_date,
          service_time : service_time,
          job_desc : job_desc,
          paymentStatus : PAYMENTSTATUS.INITIALIZE,
          job_status : JOBSTATUS.PROCESSING,
          verificationCode : code,
          cancel_reason : "",
          ...(req.files.jobImage ? { jobImage: req.files.jobImage[0].path } : {}),
          createdBy : userData._id,
          creationDate: new Date(),
          creationIp : ipAddress,
          ...(latitude ? { latitude : latitude } : null),
          ...(longitude ? { longitude : longitude } : null),
          platform : platform
        };
        // console.log('addData',addData)

        const data = await jobs.createData(addData);
        
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
 //END OF FUNCTION

/* ********************************************************************************
* Function Name   : proceedToPay
* For             : APP and Web
* Purposes        : This function is used to proceed to pay
* Creation Date   : 27-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
 exports.proceedToPay = async function (req, res){
  try {
    const userId = req.user.userId;
    const { jobID, locationID, paymentType, couponCode  }=req.body;
    if(!paymentType){
      return response.sendResponse(res, response.build('PAYMENT_TYPE_EMPTY', { }));
    } else if(!jobID){
      return response.sendResponse(res, response.build('JOBID_EMPTY', { }));
    } else {
      if(locationID && !isValidObjectId(locationID)){
        return response.sendResponse(res, response.build('SERVICE_LOCATION_NOT_FOUND',{}))
      }
      let couponUse = 0;
      //Check Job
      const jobWhere = {
        condition : { _id : jobID }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      }
      let amount      = jobDetails.amount;
      let paidAmount  = 0;
      let discount    = 0;

      if(couponCode && couponCode === 'FIRST30'){
        paidAmount    = amount - 30;
        discount      = 30
        couponUse     = 1
      }else{
        paidAmount    = amount;
        discount      = 0;
        couponUse     = 0
      }
      const updateParam = {
        paymentType : paymentType,
        paidAmount  : paidAmount,
        discount    : discount,
        isCouponUse : couponUse,
        ...(couponCode? { couponCode : couponCode}:null),
      }
      const updateData = {
        condition : { _id: jobID },
        data : updateParam
      }
      const data = await jobs.updateData(updateData);
      const options ={
        order_id    : data.job_id,
        userId      : data.user_id,
        providerData : data.providerData,
        service     : data.service_name,
        sub_service : data.sub_service_name
      }
      Notification.newJobNotificationtouser(options);
      Notification.newJobNotificationtoprovider(options);
      return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    }
  } catch (error) {
    writeLogErrorTrace(['[Job]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
}

/* ********************************************************************************
* Function Name   : proceedToPay
* For             : APP and Web
* Purposes        : This function is used to success payment
* Creation Date   : 27-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.paymentSuccess = async function (req, res){
  try {
    const { jobID, txn_no }=req.body;
    if(!txn_no){
      return response.sendResponse(res, response.build('TXN_NO_EMPTY', { }));
    } else if(!jobID){
      return response.sendResponse(res, response.build('JOBID_EMPTY', { }));
    } else {
      const updateParam = {
        paymentStatus : PAYMENTSTATUS.SUCCESS,
      }
      const updateData = {
        condition : { _id: jobID },
        data : updateParam
      }
      const data = await jobs.updateData(updateData);
      return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    }
  } catch (error) {
    writeLogErrorTrace(['[Job]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
}//End of function

/* ********************************************************************************
* Function Name   : assignJobListByProviderID
* For             : APP and Web
* Purposes        : This function is used to assign job List by provier id
* Creation Date   : 26-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.assignJobListByProviderID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { limit, skip }=req.body;
    let { order_search }=req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    let condition 
    if(order_search === 'Today'){
      let currentDate = new Date();
      var yesterday = new Date(currentDate.getTime());
      yesterday.setDate(currentDate.getDate() - 1);
      // order_search = null
      // order_search = 'Accept';
      condition = { 
        providerData : userId,
        $or : [ { job_status : 'Accept' }, { job_status : 'Start' } ], 
        //...(yesterday ? {creationDate : {$gt: yesterday }}:null ) 
      }
    } else{
      condition = { 
        providerData : userId, 
        ...(order_search ? { job_status : order_search } : null)
      }
    }

    let listWhere = {
      condition : condition,
      sort : { job_id : -1 },
      select : {
        user_id           : true,
        providerData      : true,
        service_name      : true,
        sub_service_name  : true,
        amount            : true,
        service_location  : true,
        service_date      : true,
        service_time      : true,
        job_desc          : true,
        paymentStatus     : true,
        job_status        : true,
        cancel_reason     : true,
        jobImage          : true,
        creationDate      : true,
        service_type      : true,
        otherCharges      : true,
        discount          : true,
        paidAmount        : true
      },
      ...(limit?{limit : limit}: null),
      ...(skip?{skip : skip}: null)
    }
    const data = await jobs.getData(listWhere);
    return response.sendResponse(res, response.build('SUCCESS', { result: data }));
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};//END OF FUNCTION

/* ********************************************************************************
* Function Name   : assignJobListByProviderID
* For             : APP and Web
* Purposes        : This function is used to assign job List by provier id
* Creation Date   : 26-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.jobListByWorkerID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { limit, skip }=req.body;
    let { order_search }=req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    let condition 
    if(order_search === 'Today'){
      let currentDate = new Date();
      var yesterday = new Date(currentDate.getTime());
      yesterday.setDate(currentDate.getDate() - 1);

      condition = { 
        workerData : userId,
        $or : [ { job_status : 'Accept' }, { job_status : 'Start' } ], 
      }
    } else{
      condition = { 
        workerData : userId, 
        ...(order_search ? { job_status : order_search } : null)
      }
    }
    let listWhere = {
      condition : condition,
      sort : { job_id : -1 },
      select : {
        user_id           : true,
        providerData      : true,
        service_name      : true,
        sub_service_name  : true,
        amount            : true,
        service_location  : true,
        service_date      : true,
        service_time      : true,
        job_desc          : true,
        paymentStatus     : true,
        job_status        : true,
        cancel_reason     : true,
        jobImage          : true,
        creationDate      : true,
        service_type      : true,
        otherCharges      : true,
        discount          : true,
        paidAmount        : true
      },
      ...(limit?{limit : limit}: null),
      ...(skip?{skip : skip}: null)
    }
    const data = await jobs.getData(listWhere);
    return response.sendResponse(res, response.build('SUCCESS', { result: data }));
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
}; //END OF FUNCTION
/* ********************************************************************************
* Function Name   : JobListByUserID
* For             : APP and Web
* Purposes        : This function is used to assign job List by provier id
* Creation Date   : 26-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.JobListByUserID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const {limit, skip}=req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    let listWhere = {
      condition : { user_id : userId },
      sort : { job_id : -1 },
      select : {
        user_id : true,
        providerData : true,
        service_name : true,
        sub_service_name : true,
        amount : true,
        service_location : true,
        service_date : true,
        service_time: true,
        job_desc : true,
        paymentStatus : true,
        job_status : true,
        cancel_reason : true,
        jobImage : true,
        creationDate : true,
        verificationCode : true,
        paidAmount : true,
        discount : true,
        otherCharges : true
      },
      ...(limit?{limit : limit}: null),
      ...(skip?{skip : skip}: null)
    }
    const data = await jobs.getData(listWhere);
    return response.sendResponse(res, response.build('SUCCESS', { result: data }));
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : JobDetailsByID
* For             : APP and Web
* Purposes        : This function is used to job details by job id
* Creation Date   : 01-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.JobDetailsByID = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { jobId }=req.body;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else{
      let listWhere = {
        condition : { 
          _id : jobId, 
          //providerData : userId 
        },
        sort : { job_id : -1 },
        select : {
          user_id : true,
          providerData : true,
          service_name : true,
          sub_service_name : true,
          amount : true,
          service_location : true,
          service_date : true,
          service_time: true,
          job_desc : true,
          paymentStatus : true,
          job_status : true,
          cancel_reason : true,
          jobImage : true,
          creationDate : true,
          paidAmount : true,
          discount : true,
          paymentMode : true,
          finalPaidAmount : true
        }
      }
      
      const data = await jobs.getOnlyOneData(listWhere);
      return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : assignJobToWorker
* For             : APP and Web
* Purposes        : This function is used to assign job to worker
* Creation Date   : 27-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.assignJobToWorker = async function (req, res) {
  try {
    const userId = req.user.userId;
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    const { jobId,workerID,updateIp }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else if(!jobId){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else{
      let where = {
        condition : { _id : workerID, userType : USERTYPE.WORKER, companyData:userId }
      }
      //Check worker
      const isWorker =await providerService.getData(where,'count');
      if(isWorker === 0){
        return response.sendResponse(res, response.build('ERROR_WORKER_NOT_FOUND', {}));
      }

      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      }

      const param= {
        workerData  : workerID,
        job_status : JOBSTATUS.ASSIGN,
        updateDate  : new Date(),
        updateIp    : updateIp
      }
      let updateOption = {
        condition : { _id : jobId, providerData : userId, providerUserType : USERTYPE.COMPANY },
        data : param
      }
      // console.log(updateOption);
      const data = await jobs.updateData(updateOption);
      return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : jobAccept
* For             : APP and Web
* Purposes        : This function is used to accept job
* Creation Date   : 28-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
// exports.jobAccept = async function (req, res) {
//   try {
//     const userId = req.user.userId;
//     const { jobId }=req.body;
//     //check for valid ObjectId of the given ID's]
//     if (!userId || !isValidObjectId(userId)) {
//       return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
//     } else if(!jobId || !isValidObjectId(jobId)){
//       return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
//     } else{
//       //Check Job
//       const jobWhere = {
//         condition : { _id : jobId }
//       }
//       let jobDetails =await jobs.getOnlyOneData(jobWhere);
//       if(!jobDetails){
//         return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
//       }

//       const param= {
//         job_status    : JOBSTATUS.ACCEPT,
//         jobAcceptAt   : new Date(),
//       }
//       let updateOption = {
//         condition : { _id : jobId, providerData : userId },
//         data : param
//       }
//       // console.log(updateOption);
//       const data = await jobs.updateData(updateOption);

      
//       return response.sendResponse(res, response.build('SUCCESS', { result: data }));
//     }
//   } catch (error) {
//     writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
//     return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
//   }
// };
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : jobStart
* For             : APP and Web
* Purposes        : This function is used to start job
* Creation Date   : 29-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.jobStart = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { jobId, latitude, langitude, code }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else if(!req.files.first_pic || !req.files.second_pic){
      return response.sendResponse(res, response.build('JOB_PIC_EMPTY', {}));
    }  else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      }
      if(jobDetails.job_status === 'Processing'){
        return response.sendResponse(res, response.build('JOB_ACCEPT_ERROR', {}));
      }    
      if(jobDetails.verificationCode === parseInt(code)){
        let img1 = req.files.first_pic ? req.files.first_pic[0].path : null
        let img2 = req.files.second_pic ? req.files.second_pic[0].path : null
        const param= {
          job_status        : JOBSTATUS.START,
          jobStartAt        : new Date(),
          jobStartLatitude  : latitude,
          jobStartLangitude : langitude,
          jobStartImage1    : img1,
          jobStartImage1    : img2
        }
        let updateOption = {
          condition : { 
            _id : jobId, 
            //providerData : userId 
          },
          data : param
        }
        const data = await jobs.updateData(updateOption);
        const options ={
          order_id    : data.job_id,
          userId      : data.user_id,
          providerData : data.providerData,
          service     : data.service_name,
          sub_service : data.sub_service_name,
          date        : data.service_date,
          time        : data.service_time
        }
        // console.log('options',options)
        Notification.jobStartNotyfy(options)
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      }else{
        return response.sendResponse(res, response.build('INVALID_JOB_CODE', { }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : jobAccept
* For             : APP and Web
* Purposes        : This function is used to accept job
* Creation Date   : 28-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.jobAccept = async function (req, res) {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const { jobId }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      }

      const param= {
        job_status    : JOBSTATUS.ACCEPT,
        jobAcceptAt   : new Date(),
      }
      let updateOption = {
        condition : { 
          _id : jobId, 
        },
        data : param
      }
      const data = await jobs.updateData(updateOption);

      const options ={
        order_id    : data.job_id,
        userId      : data.user_id,
        providerData : data.providerData,
        service     : data.service_name,
        sub_service : data.sub_service_name,
        date        : data.service_date,
        time        : data.service_time
      }
      // console.log('options',options)
      Notification.jobAcceptNotyfy(options)

      return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : jobReject
* For             : APP and Web
* Purposes        : This function is used to reject job
* Creation Date   : 29-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.jobReject = async function (req, res) {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const { jobId, rejectReason }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else if(!rejectReason){
      return response.sendResponse(res, response.build('REJECT_REASON_EMPTY', {}));
    } else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      } else if(jobDetails.job_status === 'Complete'){
        return response.sendResponse(res, response.build('REJECT_REASON_FOR_SUCCESS', {}));
      } else if(jobDetails.job_status === 'Start'){
        return response.sendResponse(res, response.build('REJECT_REASON_FOR_START', {}));
      } else if(jobDetails.job_status === 'Reject'){
        return response.sendResponse(res, response.build('JOB_ALREADY_REJECT', {}));
      }else{
        const param= {
          job_status      : JOBSTATUS.REJECT,
          jobRejectReason : rejectReason,
          jobRejectAt     : new Date(),
          jobRejectBy     : userType
        }
        let updateOption = {
          condition : { 
            _id : jobId, 
            //providerData : userId 
          },
          data : param
        }
        const data = await jobs.updateData(updateOption);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : jobReject
* For             : APP and Web
* Purposes        : This function is used to reject job
* Creation Date   : 28-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.jobFinish = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { jobId, updateIp }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else if(!updateIp){
      return response.sendResponse(res, response.build('IPADDRESS_EMPTY', {}));
    } else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      } else if(jobDetails.job_status === 'Complete'){
        return response.sendResponse(res, response.build('REJECT_REASON_FOR_SUCCESS', {}));
      } else if(jobDetails.job_status !== 'Start'){
        return response.sendResponse(res, response.build('JOB_NOT_START_ERROR', {}));
      } else{
        const param= {
          job_status      : JOBSTATUS.COMPLETE,
          paymentStatus   : PAYMENTSTATUS.SUCCESS,
          jobFinishAt     : new Date(),
          updateDate      : new Date(),
          updateIp        : updateIp
        }
        let updateOption = {
          condition : { 
            _id : jobId, 
          //  providerData : userId 
          },
          data : param
        }
        const data = await jobs.updateData(updateOption);
        const options ={
          order_id    : data.job_id,
          userId      : data.user_id,
          providerData : data.providerData,
          service     : data.service_name,
          sub_service : data.sub_service_name,
          date        : data.service_date,
          time        : data.service_time
        }
        console.log('options',options)
        Notification.jobFinishNotyfy(options)
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : paymentUpdate
* For             : APP and Web
* Purposes        : This function is used to reject job
* Creation Date   : 07-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.paymentUpdate = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { jobId, finalPaidAmount, paymentMode, paymentStatus, updateIp }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else if(!updateIp){
      return response.sendResponse(res, response.build('IPADDRESS_EMPTY', {}));
    } else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
 
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      } else if(jobDetails.job_status === 'Complete'){
        return response.sendResponse(res, response.build('REJECT_REASON_FOR_SUCCESS', {}));
      } else if(jobDetails.job_status !== 'Start'){
        return response.sendResponse(res, response.build('JOB_NOT_START_ERROR', {}));
      } else{
        let r_amount = 0;
        if(jobDetails.revenue_percentage > 0){
          r_amount = finalPaidAmount * jobDetails.revenue_percentage/100;
        }
        // console.log(r_amount);
        const param= {
          finalPaidAmount : finalPaidAmount,
          paymentMode     : paymentMode,
          paymentStatus   : paymentStatus,
          updateDate      : new Date(),
          updateIp        : updateIp,
          revenue_amount  : r_amount
        }
        let updateOption = {
          condition : { _id : jobId },
          data : param
        }
        // console.log('updateOption',updateOption);
        const data = await jobs.updateData(updateOption);
        const options ={
          order_id    : data.job_id,
          userId      : data.user_id,
          providerData : data.providerData,
          service     : data.service_name,
          sub_service : data.sub_service_name,
          date        : data.service_date,
          time        : data.service_time
        }
        console.log('options',options)
        Notification.jobFinishNotyfy(options)
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : getDailyRevenue
* For             : APP and Web
* Purposes        : This function is used to daily revenue
* Creation Date   : 07-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getDailyRevenue = async function (req, res) {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const mongoose = require('mongoose');
    //check for valid ObjectId of the given ID's
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else{
      const currDate = new Date();
      const currentYear = currDate.getFullYear();
      const currentMonth = currDate.getMonth();
      
      // const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      var dd = parseInt(String(currDate.getDate()).padStart(2, '0'));
      
      let data = [];

      const promises = [];

      for (let day = 1; day <= dd; day++) {
        const startDate = new Date(currentYear, currentMonth, day, 0, 0, 0);
        const endDate = new Date(currentYear, currentMonth, day, 23, 59, 59);

        const miliStartDate = startDate.getTime();
        const miliendDate = endDate.getTime();
       
        const pipeline = [
          {
            $match: {
              "creationDate": {
                $gte: parseInt(miliStartDate),
                $lte: parseInt(miliendDate),
              },
              "paymentStatus": "Success",
              ...((userType === "Worker")?{"workerData" : mongoose.Types.ObjectId(userId)}:null),
              ...((userType !== "Worker")?{"providerData" : mongoose.Types.ObjectId(userId)}:null),
              
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' }
            },
          },
        ];

        promises.push(jobs.revenueData(pipeline).then((result) => {
          if (result && result.length > 0) {
            return {date : currentYear+'-'+(currentMonth + 1)+'-'+day,  sum : result[0].totalAmount}
          } else {
            return {date : currentYear+'-'+(currentMonth + 1)+'-'+day,  sum : 0};
          }
        }));
      }

      Promise.all(promises)
        .then((result) => {
          data = result;
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        })
        .catch((error) => {
          // Handle errors, if any
          console.error(error);
          return response.sendResponse(res, response.build('ERROR', { message: 'An error occurred.' }));
        });

    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION

/* ********************************************************************************
* Function Name   : getRevenue
* For             : APP and Web
* Purposes        : This function is used to reject job
* Creation Date   : 08-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getMonthlyRevenue = async function (req, res) {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('WORKERID_EMPTY', {}));
    } else{
      const currDate = new Date();
      const previous12MonthsDates = [];
      let data = [];

      // for (let i = 0; i < 12; i++) {
      //   const year = currDate.getFullYear();
      //   const month = currDate.getMonth() - i;

      //   // Adjust the year if the month exceeds December
      //   const adjustedYear = year - Math.floor((i + 1) / 12);
      //   const adjustedMonth = (month + 12) % 12;

      //   const { firstDate, lastDate } = getFirstAndLastDateOfMonth(adjustedYear, adjustedMonth);
      //   next12MonthsDates.push({ firstDate, lastDate });
      // }
      for (let i = 0; i < 12; i++) {
        const year = currDate.getFullYear();
        const month = currDate.getMonth() - i;
      
        // Adjust the year and month if the month goes below 0
        let adjustedYear = year;
        let adjustedMonth = month;
      
        if (adjustedMonth < 0) {
          adjustedMonth += 12;
          adjustedYear -= 1;
        }
      
        // Get the first and last date of the adjusted year and month
        const { firstDate, lastDate } = getFirstAndLastDateOfMonth(adjustedYear, adjustedMonth);
        previous12MonthsDates.push({ firstDate, lastDate });
      }

      const promises = previous12MonthsDates.map(async (monthDates, index) => {
        const pipeline = [
          {
            $match: {
              createdAt: {
                $gte: monthDates.firstDate, // Filter documents with a "date" greater than or equal to the start date
                $lte: monthDates.lastDate, // Filter documents with a "date" less than or equal to the end date
              },
              paymentStatus: "Success",
              ...((userType === "Worker")?{"workerData" : mongoose.Types.ObjectId(userId)}:null),
              ...((userType !== "Worker")?{"providerData" : mongoose.Types.ObjectId(userId)}:null),
            },
          },
          {
            $group: {
              _id: null, // Use null as the _id to calculate the sum for all documents within the date range
              totalAmount: { $sum: '$amount' }, // Calculate the sum of the "amount" field
            },
          },
        ];
        const result = await jobs.revenueData(pipeline);
        if (result && result.length > 0) {
          return {date : monthDates.lastDate, sum:result[0].totalAmount}
        } else {
          return {date : monthDates.lastDate, sum:0};
        }
      });

      Promise.all(promises)
        .then((result) => {
          data = result;
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        })
        .catch((error) => {
          // Handle errors, if any
          console.error(error);
          return response.sendResponse(res, response.build('ERROR', { message: 'An error occurred.' }));
        });
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
//END OF FUNCTION
//Generate first and last date of the month
function getFirstAndLastDateOfMonth(year, month) {
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  return { firstDate, lastDate };
}

/* ********************************************************************************
* Function Name   : assignJobListByProviderID
* For             : APP and Web
* Purposes        : This function is used to assign job List by provier id
* Creation Date   : 26-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.jobTransactionHistory = async function (req, res) {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const { limit, skip }=req.body;
    
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_ID', {}));
    }
    let condition 
    if(userType === 'Worker'){
      condition = { 
        workerData : userId,
        job_status : "Complete", 
      }
    } else{
      condition = { 
        providerData : userId, 
        job_status : "Complete", 
      }
    }
    let listWhere = {
      condition : condition,
      sort : { job_id : -1 },
      select : {
        jobFinishAt       : true,
        otherCharges      : true,
        discount          : true,
        paidAmount        : true,
        finalPaidAmount   : true,
        paymentMode       : true,
        paymentStatus     : true,
        paymentType       : true

      },
      ...(limit?{limit : limit}: null),
      ...(skip?{skip : skip}: null)
    }
    const data = await jobs.getList(listWhere);
    return response.sendResponse(res, response.build('SUCCESS', { result: data }));
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
}; //END OF FUNCTION



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
}; //End of Function

/* ********************************************************************************
* Function Name   : user_order_list
* For             : APP and Web
* Purposes        : This function is used to show user order
* Creation Date   : 31-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.user_cancel_job = async function (req, res) {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const { jobId, rejectReason }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_USER_ID', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else if(!rejectReason){
      return response.sendResponse(res, response.build('REJECT_REASON_EMPTY', {}));
    } else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      } else if(jobDetails.job_status === 'Complete'){
        return response.sendResponse(res, response.build('REJECT_REASON_FOR_SUCCESS', {}));
      } else if(jobDetails.job_status === 'Start'){
        return response.sendResponse(res, response.build('REJECT_REASON_FOR_START', {}));
      } else if(jobDetails.job_status === 'Reject'){
        return response.sendResponse(res, response.build('JOB_ALREADY_REJECT', {}));
      }else{
        const param= {
          job_status      : JOBSTATUS.REJECT,
          jobRejectReason : rejectReason,
          jobRejectAt     : new Date(),
          jobRejectBy     : userType
        }
        let updateOption = {
          condition : { _id : jobId, user_id : userId },
          data : param
        }
        const data = await jobs.updateData(updateOption);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
};
/* ********************************************************************************
* Function Name   : user_order_list
* For             : APP and Web
* Purposes        : This function is used to show user order
* Creation Date   : 31-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.user_job_reschedule = async function (req, res) {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    const { jobId, locationID, service_date, service_time }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_USER_ID', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else if(!locationID){
      return response.sendResponse(res, response.build('SERVICE_LOCATION_NOT_FOUND', {}));
    } else if(!service_date){
      return response.sendResponse(res, response.build('SERVICE_DATE_EMPTY', {}));
    } else if(!service_time){
      return response.sendResponse(res, response.build('SERVICE_TIME_EMPTY', {}));
    } else{
      //Check location
      if(!isValidObjectId(locationID)){
        return response.sendResponse(res, response.build('SERVICE_LOCATION_NOT_FOUND',{}))
      }
      let locationWhere = {
        condition : { _id : locationID, user_id : userId }
      }
      let checkLocation = await userService.getAddressDataById(locationWhere)
      if(checkLocation && checkLocation.length === 0){
        return response.sendResponse(res, response.build('SERVICE_LOCATION_NOT_FOUND',{}))
      }
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      } else if(jobDetails.job_status === 'Complete'){
        return response.sendResponse(res, response.build('RESCHDULE_REASON_FOR_SUCCESS', {}));
      } else if(jobDetails.job_status === 'Start'){
        return response.sendResponse(res, response.build('RESCHDULE_REASON_FOR_START', {}));
      } else if(jobDetails.job_status === 'Reject'){
        return response.sendResponse(res, response.build('JOB_REJECTED', {}));
      }else{
        const param= {
          service_location    : locationID,
          service_date        : service_date,
          service_time        : service_time,
          jobRescheduleAt     : new Date(),
          jobRescheduleby     : userType
        }
        let updateOption = {
          condition : { _id : jobId, user_id : userId },
          data : param
        }
        const data = await jobs.updateData(updateOption);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
}; //End of Function
/* ********************************************************************************
* Function Name   : submitFeedback
* For             : APP and Web
* Purposes        : This function is used to show user order
* Creation Date   : 31-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.submitFeedback = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { jobId, message, star }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_USER_ID', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else if(!star){
      return response.sendResponse(res, response.build('STAR_EMPTY', {}));
    } else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      } else if(jobDetails.job_status !== 'Complete'){
        return response.sendResponse(res, response.build('JOB_NOT_COMPLETE_EOOR', {}));
      } else{
        const param= {
          userFeedback    : {
            star   : star,
            ...(message ? {message : message}:null),
            feedbackAt     : new Date(),
          }
        }
        let updateOption = {
          condition : { _id : jobId, user_id : userId },
          data : param
        }
        const data = await jobs.updateData(updateOption);
        if(data){
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        } else{
          return response.sendResponse(res, response.build('SUCCESS', { result: {"message" : "Job not found in your record "} }));
        }
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
}; //End of Function
/* ********************************************************************************
* Function Name   : submitFeedback
* For             : APP and Web
* Purposes        : This function is used to show user order
* Creation Date   : 31-07-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.replyFeedback = async function (req, res) {
  try {
    const userId = req.user.userId;
    const { jobId, message }=req.body;
    //check for valid ObjectId of the given ID's]
    if (!userId || !isValidObjectId(userId)) {
      return response.sendResponse(res, response.build('ERROR_INVALID_USER_ID', {}));
    } else if(!jobId || !isValidObjectId(jobId)){
      return response.sendResponse(res, response.build('JOBID_EMPTY', {}));
    } else{
      //Check Job
      const jobWhere = {
        condition : { _id : jobId }
      }
      let jobDetails =await jobs.getOnlyOneData(jobWhere);
      if(!jobDetails){
        return response.sendResponse(res, response.build('JOB_NOT_FOUND', {}));
      } else if(jobDetails.job_status !== 'Complete'){
        return response.sendResponse(res, response.build('JOB_NOT_COMPLETE_EOOR', {}));
      } else{
        const param= {
          userFeedback    : {
            star          : jobDetails.userFeedback.star,
            ...(jobDetails.userFeedback.message ? {message : jobDetails.userFeedback.message}:null),
            feedbackAt    : jobDetails.userFeedback.feedbackAt,
            reply         : message,
            replayAt      : new Date(),
          }
        }
        let updateOption = {
          condition : { _id : jobId, providerData : userId },
          data : param
        }
        const data = await jobs.updateData(updateOption);
        if(data){
          return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        } else{
          return response.sendResponse(res, response.build('SUCCESS', { result: {"message" : "Job not found in your record "} }));
        }
      }
    }
  } catch (error) {
    writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
    return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
  }
}; //End of Function

