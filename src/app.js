const express = require('express');
const app = express();

app.use("/home", (req, res) => {
    res.send("hello from home");
});

app.use("/users/hello/2", (req, res) => {
    res.send("abcdef");
});

app.use("/users/hello", (req, res) => {
    res.send("hello hello hello");
});


// The Famous /api/:version Bug
/*
    The first matching route wins.So if a generic route appears 
    before a specific route, the specific one may never run. (generic == captures / swallows)
    Express uses a linear middleware stack, not a routing tree.
    Every request iterates sequentially through registered handlers until a match is found
*/
app.get("/api/:version/users", (req, res) => {
    res.send(`Users API version ${req.params.version}`);
});

app.get("/api/health", (req, res) => {
    res.send("Server healthy");
});

app.use("/test", (req, res) => {
    res.send("hello from test");
});

// wild card
app.use("/", (req, res) => {
    res.send("hello from dashboard");
});

app.listen(3000, () => console.log("running and listening at 3000"));

