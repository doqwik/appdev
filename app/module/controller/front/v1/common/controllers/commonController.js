const response = require('../../../../../../util/response');
const {writeLogErrorTrace} = require('../../../../../../util/logger');
const {isValidObjectId} = require('../../../../../../util/valueChecker');
const moment = require("moment");

/**************************** Services ****************************/
const userService = require('../../../../../services/front/userService');
const commonService = require('../../../../../services/front/commonService');
const AllService = require('../../../../../services/front/services');
const subService = require('../../../../../services/front/sub_services');
const Counter = require('../../../../../services/front/counterService');

/************************** Services End **************************/

/* ********************************************************************************
* Function Name   : getWebHomePageData
* For             : Web
* Purposes        : This function is used for get Home page data
* Creation Date   : 02-06-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getWebHomePageData = async function (req, res) {
    try {
        // Get Banner Data
        const topBannerCondition = {
            condition : { page : "Home", display : "Web Top", status : 'A' },
            seq_order : { order: -1 }
        }
        let banner1 = await commonService.getBannerData(topBannerCondition);

        const bottomBannerCondition = {
            condition : { page : "Home", display : "Web Bottom", status : 'A' },
            seq_order : { order: -1 }
        }
        let banner2 = await commonService.getBannerData(bottomBannerCondition);
        // End

        //Get Page Heading 
        const pageHeadingCondition = {
            condition : { page : "Home", display: "Web" }
        }
        let pageheadings = await commonService.getPageHeadingsData(pageHeadingCondition);
        // End
        //Services List along with sub services
        const serviceCondition = {
            condition : { status : "A", tags : "most popular" }
        }
        let services = await AllService.getServicesAndSubServices(serviceCondition);
        //End

        //Most Popular Services for Web updated on 23-08-23
        const popularServiceCondition = {
            condition : { status : "A", popular : "Yes" },
            sort        : {"order_seq": -1},
            select : { service_image : true, icon : true, service_name : true,featured_img : true, popular :true }
        }
        let popularService = await AllService.getData(popularServiceCondition);
        //END

        //Most Featured Services for Web updated on 23-08-23
        const featuredServiceCondition = {
            condition   : { status : "A", featured : "Yes" },
            sort        : {"order_seq": -1},
            select      : { service_image : true, icon : true, service_name : true,featured_img : true, featured :true }
        }
        let featuredService = await AllService.getData(featuredServiceCondition);
        //END

        // Reson list
        const resonCondition = {
            condition : { status : "A" },
            limit : 3
        }
        let reason = await commonService.getResonDataCondition(resonCondition);
        // End
        //Get testmonial
        const testiminialCondition = {
            condition : { status : "A" },
            limit : 10
        }
        let testmonial = await commonService.getTestimonailsHeadingsData(testiminialCondition);
        //End

        const result ={
            'top_banner'    : banner1,
            'bottom_banner' : banner2,
            'pageheadings'  : pageheadings,
            'services'      : services,
            "popularService" : popularService,
            "featuredService" : featuredService,
            'reason'        : reason,
            'testmonial'    : testmonial
        }
        return response.sendResponse(res, response.build('SUCCESS', { result: result }));
    } catch (error) {
        writeLogErrorTrace(['[get web home page data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function 

/* ********************************************************************************
* Function Name   : getWebHomePageData
* For             : Web
* Purposes        : This function is used for get Home page data
* Creation Date   : 02-06-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getAppHomePageData = async function (req, res) {
    try {
        // Get Banner Data
        const bannerCondition = {
            condition : { page : "Home", display : "App Top", status : 'A' },
            seq_order : { seq_order: -1 }
        }
        let banner = await commonService.getBannerData(bannerCondition);

        const bannerCondition2 = {
            condition : { page : "Home", display : "App Bottom", status : 'A' },
            seq_order : { seq_order: -1 }
        }
        let banner2 = await commonService.getBannerData(bannerCondition2);
        // End
        //Services List along with sub services
        const serviceCondition = {
            condition : { status : "A" }
        }
        let services = await AllService.getServicesAndSubServices(serviceCondition);
        //End
        const result ={
            'top_banner' : banner,
            'bottom_banner' : banner2,
            'services' : services
        }
        return response.sendResponse(res, response.build('SUCCESS', { result: result }));
    } catch (error) {
        writeLogErrorTrace(['[get App home page data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function

/* ********************************************************************************
* Function Name   : getServicesDetailsData
* For             : Both
* Purposes        : This function is used for get services details data
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getServicesDetailsData = async function (req, res) {
    try {
        //Services List along with sub services
        const serviceCondition = {
            condition : { status : "A" }
        }
        let services = await AllService.getServicesAndSubServices(serviceCondition);
        //End
        return response.sendResponse(res, response.build('SUCCESS', { result: services }));
    } catch (error) {
        writeLogErrorTrace(['[get servises details data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function

/* ********************************************************************************
* Function Name   : getServicesDetailsDataByID
* For             : Both
* Purposes        : This function is used for get services details data by id
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getServicesDetailsDataByID = async function (req, res) {
    try {
        const { servies_id }=req.body;
        if(!servies_id){
            return response.sendResponse(res, response.build('SERVICEID_EMPTY', {}));
        }else{
            //Services List along with sub services
            const serviceCondition = {
                condition : { _id : servies_id, status : "A" }
            }
            let services = await AllService.getSingleServicesAndSubServices(serviceCondition);
            //End
            return response.sendResponse(res, response.build('SUCCESS', { result: services }));
        }
    } catch (error) {
        writeLogErrorTrace(['[get servises details data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function
/* ********************************************************************************
* Function Name   : getSubServicesdetailsDataById
* For             : Both
* Purposes        : This function is used for get services details data by id
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getSubServicesdetailsDataById = async function (req, res) {
    try {
        const { sub_servies_id }=req.body;
        if(!sub_servies_id){
            return response.sendResponse(res, response.build('SUBSERVICEID_EMPTY', {}));
        }else{
            //Services List along with sub services
            const serviceCondition = {
                condition : { _id : sub_servies_id, status : "A" }
            }
            let sub_services = await subService.getOnlyOneData(serviceCondition);
            //End
            return response.sendResponse(res, response.build('SUCCESS', { result: sub_services }));
        }
    } catch (error) {
        writeLogErrorTrace(['[get servises details data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function
/* ********************************************************************************
* Function Name   : getSubServicesdetailsDataById
* For             : Both
* Purposes        : This function is used for get services details data by id
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.subscribeNewsletter = async function (req, res) {
    try {
        const { email }=req.body;
        if(!email){
            return response.sendResponse(res, response.build('EMAIL_EMPTY', {}));
        }else{
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValidEmail = emailRegex.test(email);
            
            if(isValidEmail === false){
                return response.sendResponse(res, response.build('EMAIL_EMPTY', {}));
            } 

            const where ={
                condition : { email : email }
            }
            let subscribed = await commonService.getSubscriber(where);
            if(subscribed > 0){
                return response.sendResponse(res, response.build('ALEREADY_SUBSCRIBED', {}));
            }
            //Services List along with sub services
            const seq_id = await Counter.getSequence('dqw_provider_services');
            const param = {
                seq_id      :   seq_id,
                email       :   email,
                created_at  :   new Date() 
            }
            let insertData = await commonService.subscribeNewsletter(param);
            //End
            return response.sendResponse(res, response.build('SUCCESS', { result: insertData }));
        }
    } catch (error) {
        writeLogErrorTrace(['[get servises details data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function

/* ********************************************************************************
* Function Name   : getAboutusPageData
* For             : Both
* Purposes        : This function is used for get services details data by id
* Creation Date   : 06-06-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getAboutusPageData = async function (req, res) {
    try {
        // Get Banner Data
        const topBannerCondition = {
            condition : { page : "About us", display : "Web Top", status : 'A' },
            seq_order : { order: -1 }
        }
        let banner = await commonService.getBannerData(topBannerCondition);
        //END

        //Get Page Heading 
        const pageHeadingCondition = {
            condition : { page : "About us", display: "Web" }
        }
        let pageheadings = await commonService.getPageHeadingsData(pageHeadingCondition);
        // End

        //Get Page Heading 
        const featuresCondition = {
            condition : { status : "A" },
            sort : {seq_order : -1}

        }
        let features = await commonService.getfeatures(featuresCondition);
        // End
        //Get testmonial
        const testiminialCondition = {
            condition : { status : "A" },
            limit : 10
        }
        let testmonial = await commonService.getTestimonailsHeadingsData(testiminialCondition);
        //End
        const result = {
            'banner'        : banner,
            'pageheadings'  : pageheadings,
            'features'      : features,
            "testmonial"    : testmonial
        }
        return response.sendResponse(res, response.build('SUCCESS', { result: result }));
        
    } catch (error) {
        writeLogErrorTrace(['[get servises details data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function

/* ********************************************************************************
* Function Name   : getService
* For             : APP and Web
* Purposes        : This function is used to show all service
* Creation Date   : 23-06-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/ 

exports.getService = async function (req, res) {
    try {
      const { key } = req.headers;
  
      const options = { 
        condition : { status : "A"}
       }; 
      const type = 'data'; 
  
      const data = await commonService.getServiceData(options, type); 
      return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    } catch (error) {
      writeLogErrorTrace(['[workers registration]', '[controller] Error: ', error]);
      return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
  };
  
  
  /* ********************************************************************************
* Function Name   : getAppPageData
* For             : Web
* Purposes        : This function is used for get app page data
* Creation Date   : 13-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getAppPageData = async function (req, res) {
    try {
        // Get Banner Data
        const topBannerCondition = {
            condition : { page : "Get app", display : "Web Top", status : 'A' },
            seq_order : { order: -1 }
        }
        let banner1 = await commonService.getBannerData(topBannerCondition);
        // End
        //Get Page Heading 
        const pageHeadingCondition = {
            condition : { page : "Get app", display: "Web" }
        }
        let pageheadings = await commonService.getPageHeadingsData(pageHeadingCondition);

        //Get Page Heading 
        const getStepCondition = {
            condition : { status: "A" }
        }
        let getstep = await commonService.getappHeadingsData(getStepCondition);
        // let getstep = [];
        // End
        const result ={
            'top_banner'    : banner1,
            'pageheadings'  : pageheadings,
            'getstep'       : getstep
        }
        return response.sendResponse(res, response.build('SUCCESS', { result: result }));
    } catch (error) {
        writeLogErrorTrace(['[get web home page data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function 
 /* ********************************************************************************
* Function Name   : getHelpsafetyPageData
* For             : Web
* Purposes        : This function is used for get help & safety page data
* Creation Date   : 13-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getHelpsafetyPageData = async function (req, res) {
    try {
      
        //Get Page Heading 
        const pageHeadingCondition = {
            condition : { page : "Help safety", display: "Web" }
        }
        let pageheadings = await commonService.getPageHeadingsData(pageHeadingCondition);
        // End
        const result ={
            'pageheadings'  : pageheadings
           
        }
        return response.sendResponse(res, response.build('SUCCESS', { result: result }));
    } catch (error) {
        writeLogErrorTrace(['[get web home page data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function 
/* ********************************************************************************
* Function Name   : gettermsConditionPageData
* For             : Web
* Purposes        : This function is used for get terms & condition page data
* Creation Date   : 13-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.gettermsConditionPageData = async function (req, res) {
    try {
      
        //Get Page Heading 
        const pageHeadingCondition = {
            condition : { }
        }
        let pageheadings = await commonService.getPagetermsconditionData(pageHeadingCondition);
        // End
        const result ={
            'termsCondition'  : pageheadings
           
        }
        return response.sendResponse(res, response.build('SUCCESS', { result: result }));
    } catch (error) {
        writeLogErrorTrace(['[get web home page data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function 
/* ********************************************************************************
* Function Name   : getprivacypolicyPageData
* For             : Web 
* Purposes        : This function is used for get privacy policy  page data
* Creation Date   : 13-07-2023
* Created By      : Megha Kumari
* Update By       : 
* Update Date     : 
************************************************************************************/
exports.getprivacypolicyPageData = async function (req, res) {
    try {
      
        //Get Page Heading 
        const pageHeadingCondition = {
            condition : { }
        }
        let pageheadings = await commonService.getPageprivacyData(pageHeadingCondition);
        // End
        const result ={
            'privacyPolicy'  : pageheadings
           
        }
        return response.sendResponse(res, response.build('SUCCESS', { result: result }));
    } catch (error) {
        writeLogErrorTrace(['[get web home page data]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //End if function 
/* ********************************************************************************
* Function Name   : addService
* For             : APP and Web
* Purposes        : This function is used to add service
* Creation Date   : 17-07-2023
* Created By      : Megha kumari 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addService = async function (req, res) {
    try {
        const { service_name,service_slug } = req.body;
        if(!service_name){
          return response.sendResponse(res, response.build('SERVICENAME_EMPTY', {}));
        }else  if(!service_slug){
          return response.sendResponse(res, response.build('SERVICESLUG_EMPTY', {}));
        }else if (!req.files || !req.files.icon || req.files.icon.length === 0) {
            return response.sendResponse(res, response.build('SERVICE_ICON_EMPTY', {}));
         }else{
            const addData = {
                service_name : service_name,
                service_slug:service_slug,
              ...(req.files.icon[0].path ? {icon: req.files.icon[0].path} : null),
              creationDate: new Date(),
              isVerified : 1,
              status: "A",
              };
            const data = await commonService.createserviceData(addData);
            return response.sendResponse(res, response.build('SUCCESS', { result: data }));
         
        }
    } catch (error) {
        writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
  } //ENF OF FUNCTION
  
  /* ********************************************************************************
* Function Name   : addContactus
* For             : APP and Web
* Purposes        : This function is used to submit contact form
* Creation Date   : 09-08-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.addContactus = async function (req, res) {
    try {
        const { firstName, lastName, inquiry, email, message } = req.body;
        if(!firstName){
          return response.sendResponse(res, response.build('FIRSTNAME_EMPTY', {}));
        } else  if(!email){
          return response.sendResponse(res, response.build('EMAIL_EMPTY', {}));
        } else  if(!message){
            return response.sendResponse(res, response.build('MESSAGE_EMPTY', {}));
        }else{
            const addData = {
                firstName : firstName,
                ...(lastName?{ lastName : lastName }: ""),
                ...(inquiry?{inquiry : inquiry}: ""),
                email:email,
                ...(message ? {message:message} : null),
                creationDate: new Date(),
              };
            const data = await commonService.createContactus(addData);
            return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        }
    } catch (error) {
        writeLogErrorTrace(['[users registration]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //ENF OF FUNCTION

/* ********************************************************************************
* Function Name   : getAllCountryList
* For             : APP and Web
* Purposes        : This function is used to get all country list
* Creation Date   : 24-08-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getAllCountryList = async function (req, res) {
    try {
        const where = {
            condition : { status : 'A' },
        };
        const data = await commonService.getCountry(where);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    } catch (error) {
        writeLogErrorTrace(['[Get Country List]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //ENF OF FUNCTION

/* ********************************************************************************
* Function Name   : getAllCountryList
* For             : APP and Web
* Purposes        : This function is used to get all state list
* Creation Date   : 24-08-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getAllStateListByCountry = async function (req, res) {
    try {
        const { country_oid } = req.body;
        if(!country_oid){
            return response.sendResponse(res, response.build('COUNTRY_ID_EMPTY', {  }));
        } else{
            const where = {
                condition : { country_oid : country_oid, status : 'A' },
            };
            const data = await commonService.getState(where);
            return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        }
    } catch (error) {
        writeLogErrorTrace(['[Get Country List]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //ENF OF FUNCTION

/* ********************************************************************************
* Function Name   : getAllCountryList
* For             : APP and Web
* Purposes        : This function is used to get all city list
* Creation Date   : 24-08-2023
* Created By      : Afsar Ali 
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.getAllCityListByState = async function (req, res) {
    try {
        const { state_oid } = req.body;
        if(!state_oid){
            return response.sendResponse(res, response.build('STATE_ID_EMPTY', { }));
        } else{    
            const where = {
                condition : { state_oid : state_oid, status : 'A' },
            };
            const data = await commonService.getCIty(where);
            return response.sendResponse(res, response.build('SUCCESS', { result: data }));
        }
    } catch (error) {
        writeLogErrorTrace(['[Get Country List]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error: error }));
    }
} //ENF OF FUNCTION