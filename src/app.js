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

/*
Route pattern   → /users/:id
Request URL     → /users/profile
    users  → users ✔
    :id    → profile ✔
    Because :id means: match ANY string
*/

// IMP - after 5.x.x express ?, +, * do not work directly
// wild card * (deprecated) , ? (optional), : (param), () regex, + (one or more) etc
app.get('/users/:id', (req, res) => {
    res.send(`User ID: ${req.params.id}`);
});

app.get('/users/profile', (req, res) => {
    res.send("User profile");
});

app.get(/^\/ab+c$/, (req, res) => {
    res.send("matched ab+c pattern");
});


// app.get('/file/:name(*)', (req, res) => {
//     res.send(req.params);
// });

// app.get('/ab?c', (req, res) => {
//     res.send(req.params.id || "No ID");
// })

// app.get("/user/:id(\\d+)", (req, res) => {
//     res.send({
//         message: "Only numeric IDs allowed",
//         id: req.params.id
//     });
// });

app.use("/", (req, res) => {
    res.send("hello from dashboard");
});

app.listen(3000, () => console.log("running and listening at 3000"));

