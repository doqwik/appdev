const nodemailer = require("nodemailer");
const templates = require("../../../models/email_templates");
const { createEmailLog } = require("../../services/front/commonService");

/*************************************
 * New User Registration Mail to User
 *************************************/
exports.sendNewUserRegistrationMailToUser = async function (options) {
    const { fullName, email } = options;
    try {
        const emailWhere ={
            mail_type : "Registration Email"
        }
        let MTData = await templates.findOne(emailWhere);
        
        
        const MHData = MTData['mail_header'];
        let MBData = MTData['mail_body'];
        let MFData = MTData['mail_footer'];


        MBData = MBData.replace('{USERNAME}', fullName);

        let MHtml = MTData['html'];
        MHtml = MHtml.replace('{MAIL-HEADER}', MHData);
        MHtml = MHtml.replace('{MAIL-BODY}', MBData);
        MHtml = MHtml.replace('{MAIL-FOOTER}', MFData);
       
        MHtml = MHtml.replace(/\\/g, '');   

        const transporter = nodemailer.createTransport({
            host: 'mail.doqwik.ng',
            port: 465,
            secure: true,
            auth: {
                user: '<SMTP_EMAIL>',
                pass: '<PASSWORD>',
            },
        });
        await transporter.verify();
        console.log('Your email configuration is correct.');

        await transporter.sendMail({
          from: '"DoQwik" <info@doqwik.ng>',
          to: email,
          bcc: 'contact@doqwik.ng',
          subject: `Welcome to DoQwik Mr. ${fullName} `,
          html: MHtml
        });

        //Generate email log
        const param = {
            email : email,
            mail_type : "Registration Email",
            respounse : "Your email sent to user for new user registration.",
            status : "Success",
            creationDate : new Date()
        }
        createEmailLog(param);
        //end
        return 1
    } catch (error) {
        //Generate email log
        const param = {
            email : email,
            mail_type : "Registration Email",
            respounse : JSON.stringify(error),
            status : "Fail",
            creationDate : new Date()
        }
        createEmailLog(param);
        //end
        return Promise.reject(error);
    }
}
/*************************************
 * New User Registration Mail to Admin
 * Date : 23-08-23
 *************************************/
exports.sendNewUserRegistrationMailToAdmin = async function (options) {
    const { fullName, email, phone, userType  } = options;
    try {
        const emailWhere ={
            mail_type : "New Registration Mail To Admin"
        }
        let MTData = await templates.findOne(emailWhere);
        
        const MHData = MTData['mail_header'];
        let MBData = MTData['mail_body'];
        let MFData = MTData['mail_footer'];

        MBData = MBData.replace('{USERTYPE}', userType);
        MBData = MBData.replace('{FULLNAME}', fullName);
        MBData = MBData.replace('{EMAIL}', email);
        MBData = MBData.replace('{PHONE}', phone);

        let MHtml = MTData['html'];
        MHtml = MHtml.replace('{MAIL-HEADER}', MHData);
        MHtml = MHtml.replace('{MAIL-BODY}', MBData);
        MHtml = MHtml.replace('{MAIL-FOOTER}', MFData);
       
        MHtml = MHtml.replace(/\\/g, '');   

        const transporter = nodemailer.createTransport({
            host: 'mail.doqwik.ng',
            port: 465,
            secure: true,
            auth: {
                user: 'contact@doqwik.ng',
                pass: '@#DoQwik23@#',
            },
        });
        await transporter.verify();
        console.log('Your email configuration is correct.');

        await transporter.sendMail({
          from: '"DoQwik" <'+MTData['from_email']+'>',
          to: MTData['to_email'],
          bcc: 'contact@doqwik.ng',
          subject: `Welcome to DoQwik Mr. ${fullName} `,
          html: MHtml
        });
        //Generate email log
        const param = {
            email : MTData['to_email']?MTData['to_email']:"Admin",
            mail_type : "New Registration Mail To Admin",
            respounse : "Your email sent to admin for new user registration.",
            status : "Success",
            creationDate : new Date()
        }
        createEmailLog(param);
        //end
        return 1
    } catch (error) {
        //Generate email log
        const param = {
            email : MTData['to_email']?MTData['to_email']:"Admin",
            mail_type : "New Registration Mail To Admin",
            respounse : JSON.stringify(error),
            status : "Fail",
            creationDate : new Date()
        }
        createEmailLog(param);
        //end
        return Promise.reject(error);
    }
}