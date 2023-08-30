const Counter = require('../../../models/counter');

exports.getSequence = async function (tableName){
  return new Promise((resolve, reject) => {
    let encryptValue
    let newId
    Counter.findOne({ _id: tableName })
      .then(result => {
        if (result) {
          newId = result.seq + 1;
          encryptValue = newId;
          return Counter.updateOne(
            { _id: tableName },
            { $set: { seq: newId, encrypted: encryptValue } }
          );
        } else {
          newId = 100000000000001;
          encryptValue = newId;
          return Counter.create({
            _id: tableName,
            seq: newId,
            encrypted: encryptValue
          });
        }
      })
      .then(() => resolve(encryptValue))
      .catch(error => reject(error));
  });
}


