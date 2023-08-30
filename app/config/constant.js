const basePath = __basePath;

module.exports = {
    apikey :   "<API_KEY>",
    SMSKEY :    "SMS_API_KEY",
    NOTIFICATIONKEY : "NOTIFICATION_KEY",
    path: {
        base                        : basePath,
        app                         : basePath + 'app/',
        module                      : basePath + 'app/module/controller/',
        log                         : basePath + 'asset/log/',
        moduleV1                    : basePath + 'app/module/controller/v1/',
        lboardImg                    : '/lboard.jpg',
        faviconImg                  : '/favicon.ico'
    },
    crypto: {
        secretKey: 'vOVH7spmdNWjRRIqCc6rdsx01lwHzrf3',
        algo: 'aes-128-cbc',
        digest: 'hex',
        encoding: 'utf8',
        iv: '\x00\x01\x04\x03\x09\x05\x08\x06\x08\x07\x0a\x0b\x0c\x0d\x0f\x0f'
    },
    crons: {
        cronExpForGetAllOffers: '0 */1 * * *',
        cronTimezone: 'Asia/Kolkata'
    },
    leads: {
        origin: 'http://algosoft.co/'
    },
    notification: {
        priority: 'high',
        timeToLive: 60 * 60 * 24,
    },
    notificationLog: {
      type: 'Onboarding',
      title: 'this is title',
      body: 'i m body'
    },
    crons: {
        cronExpForGetAllOffers: '0 */1 * * *',
        cronTimezone: 'Asia/Kolkata'
    },
    roles:{
        ADMIN:"ADMIN",
        USER:"USER",
        PROVIDER:"PROVIDER"
    },
    adminAuthIssuerName: "ADMIN",
    userAuthIssuerName: "USER",
    providerAuthIssuerName: "PROVIDER",
    authTokenAdminAuthExpiresIn:"365 days",
    authTokenUserAuthExpiresIn:"365 days",
    authTokenProviderAuthExpiresIn:"365 days",
    OtpExpiry:{
            value:1,
            duration:"minutes"
        },
    OtpRetry:{
            value:1,
            duration:"minutes"
    },
    pageLimit: 10,
    pageSkip:0,
    adminForgotPasswordPostFix: "FORGOTPASSWORD",
    userForgotPasswordPostFix: "FORGOTPASSWORD",
    USERTYPE : {
        COMPANY : "Company",
        USER    : "User",
        WORKER  : "Worker",
        INDIVIDUAL : "Individual"
    },
    JOBSTATUS : {
        PROCESSING  : "Processing",
        ASSIGN      : "Assign",
        ACCEPT      : "Accept",
        REJECT      : "Reject",
        START       : "Start",
        COMPLETE    : "Complete"   
    },
    PAYMENTSTATUS : {
        INITIALIZE  : "Initialize",
        FAIL        : "Fail",
        CANCEL      : "Cancel",    
        SUCCESS     : "Success",
    }
};
