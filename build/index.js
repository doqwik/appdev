global.__basePath = process.cwd() + '/';
const app = require(__basePath + 'app/app.js');
const port = process.env.NODE_PORT;


const http = require('http');
const https = require('https');
const fs = require('fs');

/**
 * @description Listen Server at configured port
 * @event App Listener
 */
// app.listen(port, function () {
//     console.log(`Listening port ${port}`);
// });

var options = {
    key: fs.readFileSync('./doqwik.key'),
    cert: fs.readFileSync('./doqwik.crt'),
    ca: fs.readFileSync('./doqwik.ca-bundle'),
    requestCert: false,
    rejectUnauthorized: false
};

http.createServer(options, app).listen(port, function () {
    console.log(`Listening port ${port}`);
});
