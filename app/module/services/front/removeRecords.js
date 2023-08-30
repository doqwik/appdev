const removeData = require('../../../models/deletedRecords');
const mongoose = require("mongoose");

/******************************************************
 ******************* Create Data **********************
 ******************************************************/
exports.createData = async function(userParam) {
  try {
    return await removeData.create(userParam);
  } catch (error) {
    return Promise.reject(error);
  }
};

/******************************************************
 ******************* Get All Data *********************
 ******************************************************/
exports.getData = async function (options,type) {
  try {
    const { condition={}, sort={},skip,limit } = options;
    if(type == 'count'){
      return await removeData.find(condition).count();
    } else {
      return await removeData.find(condition).sort(sort).skip(skip).limit(limit);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
/******************************************************
 **************** Get only one Data *******************
 ******************************************************/
exports.getOnlyOneData = async function (options) {
  try {
    const { condition={},select={} } = options;
    return await removeData.findOne(condition).select(select);
  } catch (error) {
    return Promise.reject(error);
  }
}
/******************************************************
 ******************* Delete Data **********************
 ******************************************************/
exports.deleteOne = async function (options) {
  try {
    const { condition={} } = options;
    return await removeData.deleteOne(condition);
  } catch (error) {
    return Promise.reject(error);
  }
}

/******************************************************
 ******************* Update Data **********************
 ******************************************************/
exports.updateData = async function (options) {
  const { condition={}, data } = options;
  try {
    return await removeData.findOneAndUpdate(condition, data, {new: true});
  } catch (error) {
    return Promise.reject(error);
  }
}

/******************************************************
 ****************** Get Data by ID ********************
 ******************************************************/
exports.getDataById = async function (id) {
  try {
    return await removeData.findById(id);
  } catch (error) {
    return Promise.reject(error);
  }
}


