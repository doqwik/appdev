const userService = require('../module/services/front/userService');
const mongoose = require('mongoose');

/**
 * convert string to mongo object id
 * @param {String} id - String value
 * @returns {ObjectId}
 */
 function stringToObjectId(id){
    return new mongoose.Types.ObjectId(id);
}

  const addAddressIDtoUserProfile = async (addressID,userID) => {
    try {
      let addressList = []
      let where = {
        condition : { _id : userID },
        select: {
          addressData : true
        }
      }
      let userAddress = await userService.getDataById(where);
      if(userAddress && userAddress.addressData){
        userAddress.addressData.forEach(item => {
          addressList.push(item);
        });
        addressList.push(addressID);
        // Remove duplicate ObjectId values
        const uniqueNewSubId = addressList.filter((value, index, self) => {
          return self.findIndex(objId => objId.equals(value)) === index;
        });

        const UParam = { 
          addressData : uniqueNewSubId
        }
        const updateData = {
          condition : { _id : userID },
          data : UParam
        }
        await userService.updateData(updateData);
        return
      }else{
        addressList.push(addressID);
        const UParam = { 
          addressData : uniqueNewSubId
        }
        const updateData = {
          condition : { _id : userID },
          data : UParam
        }
        await userService.updateData(updateData);
        return
      }
    } catch (error) {
      console.log(error)
      return
    }
  }

module.exports = {
    stringToObjectId,
    addAddressIDtoUserProfile
};