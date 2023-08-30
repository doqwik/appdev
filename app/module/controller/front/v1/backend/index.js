const constant = require('../../../../../../app/config/constant');

const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const { adminDashboardData,jobList,userList,providerList  } = require('../backend/controllers/jobController');

router.get('/adminDashboardData', adminDashboardData);
router.get('/get-job-list', jobList);
router.get('/get-user-list', userList);
router.get('/get-provider-list', providerList);


exports.router = router;