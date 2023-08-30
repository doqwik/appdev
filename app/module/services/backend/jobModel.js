const jobServices = require('../../../models/jobs');
/**************************************************************
 * Get list
**************************************************************/
exports.getData = async function(options,type ='') {
    const { condition={},sort={},select={},skip,limit, populate={} }= options;
    try {
      if(type === 'count'){
        return await jobServices
                    .find(condition)
                    .count();
      }else{
        return await jobServices
                    .find(condition)
                    .select(select)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate(populate.key,populate.select);
      }
    } catch (error) {
      return Promise.reject(error);
    }
}//End of function
  
/**************************************************************
 * Revenue Data
**************************************************************/
exports.revenueData = function(options) {
  try{
    return jobServices.aggregate(options);
  } catch(error){
    return Promise.reject(error);
  }
};