const constant = require('../../../../../../app/config/constant');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        let dynamicPath = './app/public/service_icon';
        if (file.fieldname === 'icon') {
            dynamicPath = './app/public/service_icon';
        }else{
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

const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const {checkAPIKey} = require("../../../../../middleware/front/userValidation");
const { getWebHomePageData, getAppHomePageData,getAppPageData,addService,getprivacypolicyPageData,gettermsConditionPageData, getHelpsafetyPageData,getServicesDetailsData, getServicesDetailsDataByID,getService, getSubServicesdetailsDataById, subscribeNewsletter, getAboutusPageData, addContactus, getAllCountryList, getAllStateListByCountry, getAllCityListByState } = require('../common/controllers/commonController');

// Routes for web
router.post('/web-get-homepage-data',checkAPIKey, getWebHomePageData);
router.get('/web-get-aboutus-page-data',checkAPIKey, getAboutusPageData);
router.get('/web-get-getapp-page-data',checkAPIKey, getAppPageData);
router.get('/web-get-helpsafety-page-data',checkAPIKey, getHelpsafetyPageData);
router.get('/web-get-termcondition-page-data',checkAPIKey, gettermsConditionPageData);
router.get('/web-get-privacypolicy-page-data',checkAPIKey, getprivacypolicyPageData);
// Routes for App
router.post('/app-get-homepage-data',checkAPIKey, getAppHomePageData);

// Routes for Both App & WEB
router.get('/get-services-details-data',checkAPIKey, getServicesDetailsData);
router.get('/get-single-services-details-data',checkAPIKey, getServicesDetailsDataByID);
router.get('/get-single-sub-services-details-data',checkAPIKey, getSubServicesdetailsDataById);
router.get('/get-service',checkAPIKey, getService);
router.post('/add-service',upload.fields([
    { name: 'icon', maxCount: 1 }
  ]),checkAPIKey, addService);

router.post('/subscribe-newsletter',checkAPIKey, subscribeNewsletter);
router.post('/contactus-form',checkAPIKey, addContactus);

//Location
router.post('/get-country',checkAPIKey, getAllCountryList);
router.post('/get-state',checkAPIKey, getAllStateListByCountry);
router.post('/get-city',checkAPIKey, getAllCityListByState);

exports.router = router;