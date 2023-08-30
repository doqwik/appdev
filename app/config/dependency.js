const express         = require('express');
const cookieParser    = require('cookie-parser');
const swaggerDocument = require('./swagger.json');
const swaggerUi       = require('swagger-ui-express');
const constant        = require('../config/constant');
const publicDir       = require('path').join('../app/','/public');
const authCheck = require("../util/authCheck");

const options = {
    explorer        : true,
    customCss       : '.swagger-ui .topbar a{background-image: url(' + constant.path.lboardImg + ');background-size: cover;height: 50px;min-height: 36px;max-width: 150px;} .topbar-wrapper a img{display:none;}',
    customSiteTitle : 'Klean LMS',
    customFavIcon   : constant.path.faviconImg,
};

module.exports = (app) => {
    app.use(cookieParser());
    app.use(express.static(publicDir));

	//Front Controller Modules
    app.use('/front/v1/users', require('../module/controller/front/v1/users').router);
    app.use('/front/v1/common', require('../module/controller/front/v1/common').router);
    // provider
    app.use('/front/v1/provider', require('../module/controller/front/v1/provider').router);
    app.use('/front/v1/order', require('../module/controller/front/v1/order').router);
    app.use('/front/v1/backend', require('../module/controller/front/v1/backend').router);

};
