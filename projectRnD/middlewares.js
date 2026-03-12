const express = require('express');
const app = express();

// middlewares and error handling
app.use(
    "/user", 
    (req, res, next) => {
        console.log("handling route first");
        // res.send("Response first"); // even if we remove this, next wont w/o next() run
        next();
        // res.send("Response first"); // error again as connection closed after response 2
    }, 
    (req, res) => {
        console.log("handling route second");
        res.send("Response second");
        // Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    }, 
);
/*
res.send():
1️⃣ writes headers
2️⃣ writes body
3️⃣ ends HTTP response
*/


