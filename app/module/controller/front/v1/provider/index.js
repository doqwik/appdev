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
        else if (file.fieldname === 'certificate') {
            dynamicPath = './app/public/certificate';
        }
        else if (file.fieldname === 'before_work_pic' || file.fieldname === 'after_work_pic') {
            dynamicPath = './app/public/work_gallary';
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
        file.mimetype === 'image/png' ||
        file.mimetype === 'application/pdf'
        ){
        cb(null, true);
    }else{
        cb(null, false);
    }
};

const upload = multer(
    {
        storage: storage, 
        // limits: { fileSize: 1024 * 1024 * 20 },
        fileFilter: fileFilter
});
// END of FUNCTION


const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const authCheck = require("../../../../../util/authCheck");

const {checkAPIKey} = require("../../../../../middleware/front/userValidation");

const { login, verify_login_otp, register,order_list,getServices,worker_detail,company_service, reply_feedback,feedback_list,company_worker_service,updateProfile, logout, addWorker, addeditServices,worker_service_gallary,company_worker_list, editWorker,worker_service_list,worker_service_detail, addServicesbyCompany,getCompanyServicesList,getCompanyServicesDetailsByID,deteleCompanyServicesByID,addServicesbyCompanyToWorker,companyServicesList,getServiceWorkerList,delateWorker, worker_service_list_by_ID } = require('./controllers/providerController');

const { addServicesbyIndividual, getIndividualServices,getIndividualServicesDetailsByID,deteleIndividualServicesByID } = require('./controllers/individualController');

//Provider i:e Company
router.post('/login',checkAPIKey, login);
router.post('/verify-login-otp',verify_login_otp);
router.post('/provider-register', upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]), checkAPIKey, register);

router.post('/update-profile',upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]), authCheck, updateProfile);

router.post('/logout', authCheck, logout);
router.post('/add-worker',upload.fields([
    { name: 'profile_pic', maxCount: 1 }
  ]), authCheck, addWorker);
  router.post('/add-edit-services', authCheck, addeditServices);
router.post('/edit-worker',upload.fields([
    { name: 'profile_pic', maxCount: 1 }
  ]), authCheck, editWorker);

router.post('/delete-worker',authCheck, delateWorker);


router.get('/order_list',authCheck, order_list);
  
//Worker
router.get('/company_worker-list',authCheck,company_worker_list);
router.get('/worker-service-list',authCheck, worker_service_list);
router.get('/worker-service-detail',authCheck, worker_service_detail);
router.get('/feedback-list',authCheck, feedback_list);
router.get('/company-worker-service',authCheck, company_worker_service);
router.post('/reply-feedback',authCheck, reply_feedback);
router.post('/get-services', authCheck, getServices);
router.post('/worker-service-gallary', upload.fields([
    { name: 'before_work_pic',maxCount: 5 },
    { name: 'after_work_pic', maxCount: 5 }
  ]), authCheck, worker_service_gallary);
router.post('/worker-detail',checkAPIKey, worker_detail);  
router.get('/company-service',authCheck, company_service);
// Individual
router.post('/add-services-by-individual',authCheck, addServicesbyIndividual);
router.get('/get-individual-services-list',authCheck, getIndividualServices);
router.post('/get-individual-single-services',authCheck, getIndividualServicesDetailsByID);
router.post('/delete-individual-services',authCheck, deteleIndividualServicesByID);
//Company Services Manager
router.post('/addedit-services-by-company',authCheck, addServicesbyCompany);
router.get('/get-company-services-list',authCheck, getCompanyServicesList);
router.post('/get-company-single-services',authCheck, getCompanyServicesDetailsByID);
router.post('/delete-company-services',authCheck, deteleCompanyServicesByID);

router.get('/company-services-list',authCheck, companyServicesList);


router.post('/add-services-company-worker',authCheck, addServicesbyCompanyToWorker);
router.post('/company-service-worker-list',authCheck, getServiceWorkerList);

router.get('/get-worker-service-list',authCheck, worker_service_list_by_ID);




exports.router = router;