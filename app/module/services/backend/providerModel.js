const providerServices = require('../../../models/provider');
/**************************************************************
 * Get list
**************************************************************/
exports.getData = async function(options,type ='') {
    const { condition={},sort={},select={},skip,limit }= options;
    try {
      if(type === 'count'){
        return await providerServices
                    .find(condition)
                    .count();
      }else{
        return await providerServices
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