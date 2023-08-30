const User = require('../../../models/orderplace');
const jobServices = require('../../../models/jobs');
const COUPON = require('../../../models/coupon');


/**************************************************************
 * Create new entry
**************************************************************/
exports.createData = function(userData) {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await jobServices.create(userData);

      let populatedData = await jobServices.findById(data._id).populate('providerData service_location', 'fullName address1 address2 land_mark postal_code city state country profile_pic latitude longitude');

      resolve(populatedData);
    } catch (error) {
      reject(error);
    }
  });
};
 //End of function
/**************************************************************
 * Get list
**************************************************************/
exports.getData = async function(options) {
  const { condition={},sort={},select={},skip,limit }= options;
  try {
    return await jobServices.find(condition).select(select).sort(sort).skip(skip).limit(limit).populate('providerData service_location service_type user_id','fullName address1 address2 land_mark postal_code city state country profile_pic latitude longitude serviceData');
  } catch (error) {
    return Promise.reject(error);
  }
}//End of function
/**************************************************************
 * Get SIngle Data
**************************************************************/
exports.getOnlyOneData = async function(options) {
  const { condition={},sort={},select={} }= options;
  try {
    return await jobServices.findOne(condition).select(select).sort(sort).populate('providerData service_location','fullName address1 address2 land_mark postal_code city state country profile_pic latitude longitude');;
  } catch (error) {
    return Promise.reject(error);
  }
}//End of function
/**************************************************************
 * Update Data
**************************************************************/
exports.updateData = function(options) {
  return new Promise((resolve, reject) => {
    const { condition = {}, data } = options;
    jobServices.findOneAndUpdate(condition, data, {new: true})
      .then(updatedData => resolve(updatedData))
      .catch(error => reject(error));
  });
};

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

/**************************************************************
 * Get list
**************************************************************/
exports.getList = async function(options) {
  const { condition={},sort={},select={},skip,limit }= options;
  try {
    return await jobServices.find(condition).select(select).sort(sort).skip(skip).limit(limit);
  } catch (error) {
    return Promise.reject(error);
  }
}//End of function