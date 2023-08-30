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
        }else if (file.fieldname === 'image') {
            dynamicPath = './app/public/notification';
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
        //limits: { fileSize: 1024 * 1024 * 2 },
        fileFilter: fileFilter
});
// END of FUNCTION


const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

// User Detail
const {login, verify_login_otp, register, getregister,notification,notification_add,edit_user,user_list,feedback, getuserById,getuserupdate,userdelete,edit_address,address,forgotPassword, resetPassword, getProfileData, updateProfile, changePassword,address_list,logout, getServiceProviderList, getServiceProviderByID,removeAddress,setDefaultAddress,addressDetailbyID, eamiTest} = require('../users/controllers/userController');


//website

const authCheck = require("../../../../../util/authCheck");

const {userRegisterValidation, userUpdateValidation,checkAPIKey
} = require("../../../../../middleware/front/userValidation");

router.post('/login',checkAPIKey, login);
router.post('/verify-login-otp',verify_login_otp);
router.post('/user-register', upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]), checkAPIKey, register);
router.post('/edit-user', upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]), authCheck, edit_user);
  router.post('/address',authCheck, address);
//  router.post('/rating',authCheck, rating);
router.post('/forgot-password', forgotPassword);
router.post('/logout', authCheck, logout);
router.get('/address-list',authCheck, address_list);
router.post('/edit_address',authCheck, edit_address);
// router.post('/feedback',authCheck, feedback);
router.post('/user-list',checkAPIKey,user_list);
router.get('/notification',checkAPIKey,notification);
router.post('/notification-add',upload.fields([
    { name: 'image', maxCount: 1 }
]),checkAPIKey,notification_add);

//Website
router.post('/web-service-provider-list',checkAPIKey,getServiceProviderList);
router.post('/web-service-provider-details',checkAPIKey,getServiceProviderByID);
router.post('/delete-addresss',authCheck,removeAddress);
router.post('/set-default-addresss',authCheck,setDefaultAddress);

router.post('/get-address-detail',authCheck,addressDetailbyID);

router.post('/email-test', eamiTest);


exports.router = router;