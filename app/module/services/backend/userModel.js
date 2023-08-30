const userServices = require('../../../models/users');
/**************************************************************
 * Get list
**************************************************************/
exports.getData = async function(options,type ='') {
    const { condition={},sort={},select={},skip,limit }= options;
    try {
      if(type === 'count'){
        return await userServices
                    .find(condition)
                    .count();
      }else{
        return await userServices
                    .find(condition)
                    .select(select)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit);
      }
    } catch (error) {
      return Promise.reject(error);
    }
}//End of function