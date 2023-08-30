const Services = require('../../../models/services');
const subServices = require('../../../models/sub_services');

//Select All
exports.getData = async function (options) {
  const findServices = (options) => {
    const { condition = {}, select={},sort={} } = options;
    return Services.find(condition).select(select).sort(sort);
  };
  try {
    return findServices(options);
  } catch (error) {
    return Promise.reject(error);
  }  
}//END

//Select All
exports.getServicesAndSubServices = async function (options) {
  const findServices = (options) => {
    const { condition = {} } = options;
    return Services.find(condition)
      .populate('sub_services')
      .exec();
  };
  try {
    return findServices(options);
  } catch (error) {
    return Promise.reject(error);
  }  
}//END
// Select only one
exports.getSingleServicesAndSubServices = async function (options) {
  const findServices = (options) => {
    const { condition = {} } = options;
    return Services.findOne(condition)
      .populate('sub_services')
      .exec();
  };
  try {
    return findServices(options);
  } catch (error) {
    return Promise.reject(error);
  }  
}

