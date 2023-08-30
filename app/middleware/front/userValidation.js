const response = require('../../util/response');
const {writeLogErrorTrace} = require('../../util/logger');
const {isValidObjectId} = require('../../util/valueChecker');
const userService = require('../../module/services/front/userService');
const constant = require(__basePath + '/app/config/constant');
const moment = require("moment");
const _ = require("lodash");
const Joi = require('joi');    //https://www.bacancytechnology.com/blog/joi-validation-in-nodejs-and-express
var slugify = require('slugify')

exports.userRegisterValidation = async function (req, res, next) {
    const { firstName, lastName, email, password, professionId, specialtieId } = req.body;
    const validation = Joi.object({
        firstName: Joi.string().min(3).max(35).trim(true).required(),
        lastName: Joi.string().min(3).max(35).trim(true).required(),
        email: Joi.string().email().trim(true).required(),
        password: Joi.string().min(6).trim(true).required()
       // professionId: Joi.string().trim(true).required(),
       // specialtieId: Joi.string().trim(true).required()
    });
    const payload = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
       // professionId: professionId,
        //specialtieId: specialtieId
    };
    const { error } = validation.validate(payload);
    if (error) {
        return response.sendResponse(res, response.build("ERROR_VALIDATION", { error: `${error.message}` }) );
    } else {
        const dataCondition = { condition: {"email" : email } };
        const data = await userService.getData(dataCondition);
        if(_.isEmpty(data)) {
            next();
        } else {
            return response.sendResponse(res, response.build("ERROR_VALIDATION", { error: 'Email is already exist' }) );
        }
    }
}

exports.userUpdateValidation = async function (req, res, next) {
    const userId = req.user.userId;
    const { firstName, lastName, email, professionId, specialtieId } = req.body;
    const validation = Joi.object({
        firstName: Joi.string().min(3).max(35).trim(true).required(),
        lastName: Joi.string().min(3).max(35).trim(true).required(),
        email: Joi.string().email().trim(true).required(),
        professionId: Joi.string().trim(true).required(),
        specialtieId: Joi.string().trim(true).required()
    });
    const payload = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        professionId: professionId,
        specialtieId: specialtieId
    };
    const { error } = validation.validate(payload);
    if (error) {
        return response.sendResponse(res, response.build("ERROR_VALIDATION", { error: `${error.message}` }) );
    } else {
        const dataCondition = { condition: {"email" : email, "_id" : {$ne: userId} } };
        const data = await userService.getData(dataCondition);
        if(_.isEmpty(data)) {
            next();
        } else {
            return response.sendResponse(res, response.build("ERROR_VALIDATION", { error: 'Email is already exist' }) );
        }
    }
}

exports.checkAPIKey = async function (req, res, next) {
    const {key} = req.headers;
    if(key === constant.apikey){
        console.log('match')
        next();
    }else{
        console.log('not');
        return response.sendResponse(res, response.build("ERROR_TOKEN_REQUIRED", { error: 'Unauthorized Request' }) );
    }
    
}