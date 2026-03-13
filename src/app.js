const express = require('express');
const app = express();
const {adminAuth, userAuth} = require("./middlewares/auth");

// greedy route so req go through it eg /admin/abc
// file is in auth.js

app.use("/admin", adminAuth);

app.use("/", (err, req, res, next) => { // 2 param , 3 param, 4 param
    if(err) {
        // logging errors
        // catch futther by next(err) and hide sensitive info
        res.status(500).send("something is wrong");
    }
})

// middlewares .use() and roles
// const authMiddleware = () => {}
// const handler = () => {}
// app.get("/profile", authMiddleware, handler)

app.get("/admin/getUserData", (req, res, next) => { 
    // logic of fetching all data (auth + RBAC) - Middlewares

    // const token = req.body?.token;
    // const token = "Bearer xyz";
    // const isAdminAuthorized = token === "Bearer xyz";
    // if(isAdminAuthorized) {

    // }
    throw new Error("hhhhhhhh");
    res.send("all data sent")
})

// error handling - central, async wrapper etc
app.use("/", (err, req, res, next) => { // 2 param , 3 param, 4 param
    if(err) {
        // logging errors
        // catch futther by next(err) and hide sensitive info
        res.status(500).send("something is wrong");
    }
})

app.listen(3000, () => console.log("running and listening at 3000"));

