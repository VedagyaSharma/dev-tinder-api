const express = require('express');
const app = express();

app.use("/home", (req, res) => {
    res.send("hello from home");
});


app.use("/test", (req, res) => {
    res.send("hello from test");
});

app.use("/", (req, res) => {
    res.send("hello from dashboard");
});

app.listen(3000, () => console.log("running and listening at 3000"));

