const cors       = require('cors');
const helmet     = require('helmet');
const express    = require('express');
const app        = express();
const constant   = require('../app/config/constant');
const exception  = require('../app/util/exception');
const {dbConnection} = require('../app/util/mongo');
const path = require('path');

const Jobs = require('./models/jobs');

// load env variables
require('dotenv').config();
app.use('/app/public',express.static('app/public'));
const frontendBuildPath = path.join(__dirname, '../front-end/build');
const FRONT_END_FILE_INDEX = path.join(__dirname, '../front-end/build/index.html');
app.use(express.static(frontendBuildPath));


// connect to mongo
dbConnection();

const pipeline = [
    { $match: { 'job_status': 'Reject' } },
  ];
  const changeStream = Jobs.watch()

  changeStream.on('change', (change) => {
    console.log('Change detected:', change);
  });
/*
 * @description Middlewares for parsing body
 */
app.use(cors({
    origin  : '*',
    headers : process.env.CORS_HEADERS.split(",") || '*',
    methods : ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'key' ,'Authorization' ,'authorization' ,'slot_id' , 'worker_id', 'address_id']
}));

app.use(express.static(path.join(__dirname, "..", "front-end/build"))); //React build directory

app.use(helmet());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
/////////////////////////////
app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' https://geolocation-db.com/ https://lumberjack-cx.razorpay.com/ https://ipapi.co/; font-src 'self' https://fonts.googleapis.com/ https://fonts.gstatic.com/ https://cdnjs.cloudflare.com/; img-src 'self' blob: data: https://moneysaverz.com/ https://doolally.in/ https://res.cloudinary.com/ ; script-src 'self' https://code.jquery.com/jquery-3.2.1.slim.min.j https://cdnjs.cloudflare.com/ https://code.jquery.com/jquery-3.2.1.slim.min.js https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js https://cdnjs.cloudflare.com/ https://checkout.razorpay.com/ https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js https://js.paystack.co/v1/inline.js; style-src 'self' https://moneysaverz.com/ https://fonts.googleapis.com/ https://cdnjs.cloudflare.com/ 'unsafe-inline';  frame-src 'self'"
    );
    next();
});
//////////////////////////////////
/*
 * Injecting all dependencies Modules + common libs
 */
require('../app/config/dependency')(app);
// React build directory
app.use((req, res, next) => {

    res.sendFile(path.join(__dirname, "..", "front-end/build/index.html"));
    // req.end();
});
// END
/*
 * @description Catch 404 error if no route found
 */
app.use(exception.unknownRouteHandler);

/*
 * @description Error handler
 */
app.use(exception.errorHandler);

module.exports = app;
