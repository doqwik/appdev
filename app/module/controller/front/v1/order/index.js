const constant = require('../../../../../../app/config/constant');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
//Upload Image 
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        let dynamicPath = './app/public/user_profile';
        if (file.fieldname === 'profile_pic') {
            dynamicPath = './app/public/user_profile';
        }
        // Check if the file is a document
        else if (file.fieldname === 'document') {
            dynamicPath = './app/public/document';
        }
        else if (file.fieldname === 'slot_pic') {
            dynamicPath = './app/public/slot_detail';
        } else if (file.fieldname === 'first_pic') {
            dynamicPath = './app/public/job';
        } else if (file.fieldname === 'second_pic') {
            dynamicPath = './app/public/job';
        }
        else{
            dynamicPath = './app/public';
        }
        cb(null,dynamicPath);
    },
    filename: function(req, file, cb){
        const sanitizedOriginalname = file.originalname.trim().replace(/\s+/g, '_');
        cb(null, uuidv4().substring(0, 15) + '_' + sanitizedOriginalname);
        // cb(null, uuidv4().substring(0, 15) + '_' + file.originalname);
    } 
});
const fileFilter = function(req, file, cb){
    if(
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png'  ){
        cb(null, true);
    }else{
        cb(null, false);
    }
};

const upload = multer(
    {
        storage: storage, 
      //  limits: { fileSize: 1024 * 1024 * 10 },
        fileFilter: fileFilter
});
// END of FUNCTION


const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

// User Detail
const {slot_details,order_summary,apply_coupon_code,job_finish,job_start,order_reject,assign_order,order_accept,order_detail,checkout,coupon_code,order_complete,order_list,reschedule_slot,cancel_order, paystackCallback, webhookCallback} = require('../order/controllers/orderController');

const { assignJob,assignJobListByProviderID,JobListByUserID,assignJobToWorker, proceedToPay, paymentSuccess, jobAccept, jobStart, jobReject, jobFinish, user_cancel_job, user_job_reschedule, submitFeedback, replyFeedback,JobDetailsByID, paymentUpdate, jobListByWorkerID, getDailyRevenue, getMonthlyRevenue, jobTransactionHistory } = require('../order/controllers/jobsController');

//website 

const authCheck = require("../../../../../util/authCheck");

const {userRegisterValidation, userUpdateValidation,checkAPIKey
} = require("../../../../../middleware/front/userValidation");

// router.post('/slot-details', upload.fields([
//     { name: 'slot_pic', maxCount: 1 }
//   ]),authCheck, slot_details);
// router.post('/order-summary',authCheck, order_summary);
// router.post('/checkout',authCheck, checkout);
// router.get('/order_list',authCheck, order_list);
// router.post('/cancel-order',authCheck, cancel_order);
// router.post('/order-complete',authCheck, order_complete);
// router.post('/reschedule-slot', upload.fields([
//     { name: 'slot_pic', maxCount: 1 }
//   ]),authCheck, reschedule_slot);
// router.post('/coupon-code',checkAPIKey, coupon_code);
// router.post('/apply-coupon-code',authCheck, apply_coupon_code);

// router.post('/order-detail',authCheck, order_detail);
// router.post('/order-accept',authCheck, order_accept);
// router.post('/order-reject',authCheck, order_reject);
// router.post('/assign-order', authCheck, assign_order);
// router.post('/job-start', authCheck, job_start);
// router.post('/job-finish',upload.fields([
//     { name: 'job_first_pic',maxCount: 1 },
//     { name: 'job_second_pic',maxCount: 1 }
//   ]), authCheck, job_finish);
//Website

router.get('/paystackCallback', paystackCallback);
router.get('/webhookCallback', webhookCallback);

//26-07-2023
router.post('/assign-job', upload.fields([
    { name: 'jobImage', maxCount: 4 }
  ]),authCheck, assignJob);

router.post('/proceed-to-pay',authCheck,  proceedToPay);
router.post('/payment-success',authCheck,  paymentSuccess);


router.post('/get-provider-job-list',authCheck,  assignJobListByProviderID);
router.post('/assign-job-to-worker',authCheck,  assignJobToWorker);

router.post('/worker-job-list',authCheck, jobListByWorkerID);


router.post('/job-accept',authCheck,  jobAccept);
router.post('/job-start',authCheck, upload.fields([
        { name: 'first_pic',maxCount: 1 },
        { name: 'second_pic',maxCount: 1 }
      ]), jobStart);
router.post('/job-reject',authCheck, jobReject);

router.post('/job-finish',authCheck, jobFinish);
router.post('/payment-update',authCheck, paymentUpdate);



router.post('/reply-feedback',authCheck, replyFeedback);


//User
router.post('/get-user-job-list',authCheck,  JobListByUserID);
router.post('/job-cancel-by-user',authCheck, user_cancel_job);
router.post('/job-reschedule-by-user',authCheck, user_job_reschedule);
router.post('/submit-feedback',authCheck, submitFeedback);

router.post('/get-job-details',authCheck, JobDetailsByID);

router.get('/get-monthly-revenue',authCheck, getMonthlyRevenue);
router.get('/get-daily-revenue',authCheck, getDailyRevenue);
router.get('/get-transaction-history',authCheck, jobTransactionHistory);







exports.router = router;