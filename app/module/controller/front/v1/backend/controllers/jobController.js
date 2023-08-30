const jobs = require('../../../../../services/backend/jobModel');
const users = require('../../../../../services/backend/userModel');
const provider = require('../../../../../services/backend/providerModel');
const response = require('../../../../../../util/response');
const {writeLogErrorTrace} = require('../../../../../../util/logger');
const {isValidObjectId} = require('../../../../../../util/valueChecker');

/* ********************************************************************************
* Function Name   : jobList
* For             : Admin
* Purposes        : This function is used to get job list
* Creation Date   : 02-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.jobList = async function (req, res) {
    try {
        const { condition={}, select ={}, limit, skip, sort={}, populate={}, type  }=req.body;
        let listWhere = {
            ...(condition? {condition : condition}:null),
            ...(sort? {sort : sort}:null),
            ...(select? {select : select}:null),
            ...(limit?{limit : limit}: 10),
            ...(skip?{skip : skip}: 0),
            ...(populate?{populate : populate}:null)
        }
        const data = await jobs.getData(listWhere,type?"count":null);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    } catch (error) {
        writeLogErrorTrace(['[Admin Job List]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //END OF FUNCTION

/* ********************************************************************************
* Function Name   : userList
* For             : Admin
* Purposes        : This function is used to get user list
* Creation Date   : 22-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.userList = async function (req, res) {
    try {
        const { condition={}, select ={}, limit, skip, sort={}, populate={}, type  }=req.body;
        let listWhere = {
            ...(condition? {condition : condition}:null),
            ...(sort? {sort : sort}:null),
            ...(select? {select : select}:null),
            ...(limit?{limit : limit}: 10),
            ...(skip?{skip : skip}: 0)
        }
        const data = await users.getData(listWhere,type?"count":null);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    } catch (error) {
        writeLogErrorTrace(['[Admin User List]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //END OF FUNCTION

/* ********************************************************************************
* Function Name   : providerList
* For             : Admin
* Purposes        : This function is used to get provider list
* Creation Date   : 22-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.providerList = async function (req, res) {
    try {
        const { condition={}, select ={}, limit, skip, sort={}, populate={}, type  }=req.body;
        // console.log(condition);
        let listWhere = {
            ...(condition? {condition : condition}:null),
            ...(sort? {sort : sort}:null),
            ...(select? {select : select}:null),
            ...(limit?{limit : limit}: 10),
            ...(skip?{skip : skip}: 0)
        }
        // console.log('listWhere',listWhere)
        const data = await provider.getData(listWhere,type?"count":null);
        return response.sendResponse(res, response.build('SUCCESS', { result: data }));
    } catch (error) {
        writeLogErrorTrace(['[Admin User List]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //END OF FUNCTION

/* ********************************************************************************
* Function Name   : adminDashboardData
* For             : Admin
* Purposes        : This function is used to get adminDashboardData
* Creation Date   : 08-08-2023
* Created By      : Afsar Ali
* Update By       : 
* Update Date     : 
************************************************************************************/ 
exports.adminDashboardData = async function(req, res){
    try {
        const currDate = new Date();
        const currentYear = currDate.getFullYear();
        const currentMonth = currDate.getMonth();
        const currentDate = currDate.getDate();
        const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        console.log('daysInCurrentMonth',daysInCurrentMonth);
        /***************************************************************** */
        //Get today revenue
        let startDate = new Date(currentYear, currentMonth, currentDate, 0, 0, 0);
        let endDate = new Date(currentYear, currentMonth, currentDate, 23, 59, 59);
        let miliStartDate = startDate.getTime()
        let miliendDate = endDate.getTime()
        const pipeline = [
            {   $match: { 
                    "creationDate": { $gte: parseInt(miliStartDate), $lte: parseInt(miliendDate), },
                    "paymentStatus": "Success",
                },
            },
            {   $group: { _id: null, totalAmount: { $sum: '$amount' } }, },
          ];
          const todayEarning = await jobs.revenueData(pipeline).then(result => {
                if (result && result.length > 0) {
                    return result[0].totalAmount
                } else { return 0 }
          })
        /***************************************************************** */

        /***************************************************************** */
        //Get Month revenue
        startDate = new Date(currentYear, currentMonth, 1, 0, 0, 0);
        endDate = new Date(currentYear, currentMonth + 1, daysInCurrentMonth, 23, 59, 59);
        miliStartDate = startDate.getTime()
        miliendDate = endDate.getTime()
        const monthPipeline = [
            {   $match: {
                    "creationDate": { $gte: parseInt(miliStartDate), $lte: parseInt(miliendDate), },
                    "paymentStatus": "Success",
                },
            },
            {   $group: { _id: null, totalAmount: { $sum: '$amount' } }, },
            ];
            const monthEarning = await jobs.revenueData(monthPipeline).then(result => {
                if (result && result.length > 0) {
                    return result[0].totalAmount
                } else { return 0 }
            })
        /***************************************************************** */

        /***************************************************************** */
        //Get last Month revenue
        var currentYear1 = new Date().getFullYear();
        var currentMonth1 = new Date().getMonth() + 1; // Adding 1 to adjust for 0-indexed months
        var daysInCurrentMonth1 = new Date(currentYear1, currentMonth1 -2, 0).getDate(); // Get the number of days in the current month

        var lastStartDate = new Date(currentYear1, currentMonth1 - 2, 1, 0, 0, 0);
        var lastEndDate = new Date(currentYear1, currentMonth1 - 2, daysInCurrentMonth1, 23, 59, 59);

        miliStartDate = lastStartDate.getTime()
        miliendDate = lastEndDate.getTime()
        const lastMonthPipeline = [
            {   $match: {
                    "creationDate": { $gte: parseInt(miliStartDate), $lte: parseInt(miliendDate), },
                    "paymentStatus": "Success",
                },
            },
            {   $group: { _id: null, totalAmount: { $sum: '$amount' } }, },
            ];
        const lastMonthEarning = await jobs.revenueData(lastMonthPipeline).then(result => {
            if (result && result.length > 0) {
                return result[0].totalAmount
            } else { return 0 }
        })
        /***************************************************************** */

         /***************************************************************** */
        //Get Year revenue
        startDate = new Date(currentYear, 1, 1, 0, 0, 0);
        endDate = new Date(currentYear + 1, 12, 31, 0, 0, 0);
        miliStartDate = startDate.getTime()
        miliendDate = endDate.getTime()
        const yearsPipeline = [
            {
              $match: {
                "creationDate": {
                  $gte: parseInt(miliStartDate),
                  $lte: parseInt(miliendDate),
                },
                "paymentStatus": "Success",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount' }
              },
            },
          ];
          const yearEarning = await jobs.revenueData(yearsPipeline).then(result => {
                if (result && result.length > 0) {
                    return result[0].totalAmount
                } else {
                    return 0
                }
          })
        /***************************************************************** */

        /***************************************************************** */
        //Get Total revenue
        const totalPipeline = [
            {   $match: { "paymentStatus": "Success" }, },
            {   $group: {  _id: null, totalAmount: { $sum: '$amount' } }, },
          ];
          const totalEarning = await jobs.revenueData(totalPipeline).then(result => {
                if (result && result.length > 0) {
                    return result[0].totalAmount
                } else { return 0 }
          })
        /***************************************************************** */
        
        /***************************************************************** */
        //Get Active User
        const activeUserPipeline = [
            {   $group: { _id: "$user_id", orderCount: { $sum: 1 } } },
            {   $sort: { orderCount: -1 } },
            {   $limit: 1 },
            {   $project: { _id: 1, orderCount: 1 } }
        ];
        const activeUser = await jobs.revenueData(activeUserPipeline).then(async result => {
            if (result && result.length > 0) {
                const userWhere ={
                    condition : { user_id : result[0]._id },
                    select : { user_id : true },
                    sort : { job_id : -1 },
                    limit : 1,
                    populate : {
                        key : "user_id",
                        select : "fullName"
                    }
                }
               return await jobs.getData(userWhere);
            } else { return [] }
        })
        /***************************************************************** */

        /***************************************************************** */
        //Get Active Worker
        const activeWorkerPipeline = [
            {   $match: { "paymentStatus": "Success" } },
            {   $group: { _id: "$workerData", orderCount: { $sum: 1 } } },
            {   $sort: { job_id: -1 } },
            {   $limit: 1 },
            {   $project: { workerData: "$_id", orderCount: 1 } }
        ];
        const activeWorker = await jobs.revenueData(activeWorkerPipeline).then(async result => {
            if (result && result.length > 0) {
                const userWhere ={
                    condition : { workerData : result[0]._id },
                    select : { workerData : true },
                    sort : { job_id : -1 },
                    limit : 1,
                    populate : {
                        key : "workerData",
                        select : "fullName"
                    }
                }
               return await jobs.getData(userWhere);
            } else {
                return []
            }
        })
        
        /***************************************************************** */

        /***************************************************************** */
        //Get Active Individual
        const activeIndividualPipeline = [
            {   $match: { "paymentStatus": "Success", "providerUserType" : "Individual" } },
            {   $group: { _id: "$providerData", orderCount: { $sum: 1 } } },
            {   $sort: { job_id: -1 } },
            {   $limit: 1 },
            {   $project: { providerData: "$_id", orderCount: 1 } }
        ];
        const activeIndividual = await jobs.revenueData(activeIndividualPipeline).then(async result => {
            if (result && result.length > 0) {
                const userWhere ={
                    condition : { providerData : result[0]._id },
                    select : { providerData : true },
                    sort : { job_id : -1 },
                    limit : 1,
                    populate : {
                        key : "providerData",
                        select : "fullName"
                    }
                }
               return await jobs.getData(userWhere);
            } else {
                return []
            }
        })
        /***************************************************************** */

        /***************************************************************** */
        //Get Active Company
        const activeCompanyPipeline = [
            {   $match: { "paymentStatus": "Success", "providerUserType" : "Company" } },
            {   $group: { _id: "$providerData", orderCount: { $sum: 1 } } },
            {   $sort: { job_id: -1 } },
            {   $limit: 1 },
            {   $project: { providerData: "$_id", orderCount: 1 } }
        ];
        const activeCompany = await jobs.revenueData(activeCompanyPipeline).then(async result => {
            if (result && result.length > 0) {
                const userWhere ={
                    condition : { providerData : result[0]._id },
                    select : { providerData : true },
                    sort : { job_id : -1 },
                    limit : 1,
                    populate : {
                        key : "providerData",
                        select : "fullName"
                    }
                }
               return await jobs.getData(userWhere);
            } else {
                return []
            }
        })
        /***************************************************************** */

        /***************************************************************** */
        //Get Android App Ratio
        const androidPipeline = [
            {   $match: { "paymentStatus": "Success", "platform" : "android" } },
            {   $group: { _id: "$providerData", orderCount: { $sum: 1 } } },
            {   $sort: { job_id: -1 } },
            {   $limit: 1 },
            
        ];
        const androidRatio = await jobs.revenueData(androidPipeline).then(async result => {
            if (result && result.length > 0) {
               return result[0].orderCount
            } else {
                return 0
            }
        })
        /***************************************************************** */

        /***************************************************************** */
        //Get Android App Ratio
        const webPipeline = [
            {   $match: { "paymentStatus": "Success", "platform" : "Web" } },
            {   $group: { _id: "$providerData", orderCount: { $sum: 1 } } },
            {   $sort: { job_id: -1 } },
            {   $limit: 1 },
            
        ];
        const webRatio = await jobs.revenueData(webPipeline).then(async result => {
            if (result && result.length > 0) {
               return result[0].orderCount
            } else {
                return 0
            }
        })
        /***************************************************************** */

        return response.sendResponse(res, response.build('SUCCESS', { 
            result : { 
                        todayEarning        : todayEarning, 
                        monthEarning        : monthEarning, 
                        lastMonthEarning    : lastMonthEarning,
                        yearEarning         : yearEarning, 
                        totalEarning        : totalEarning, 
                        activeUser          : activeUser[0], 
                        activeWorker        : activeWorker[0], 
                        activeIndividual    : activeIndividual[0], 
                        activeCompany       : activeCompany[0],
                        androidRatio        : androidRatio,
                        webRatio            : webRatio 
                    } }));

    } catch(error){
        writeLogErrorTrace(['[Admin]', '[controller] Error: ', error]);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
} //End of Function