const express = require('express');
const app = express();
const {connectDB} = require('./config/database');
const {User} = require("./models/user");

app.post("/signup", async (req, res) => {
    const userObj = {
        firstName: "Ronaldo",
        lastName: "McCullum",
        emailId: "rm@sharma.com",
        password: "rm@123",
        age: 26
    }

    try {
        // creating a new instance of user model
        const user = new User(userObj);
        await user.save();
        res.status(201).json("user inserted successfully")
    } catch (error) {
        res.status(400).json("error savig user data : " + error.message);
    }
});

connectDB().then(() => {
    console.log("db connected successfully")
    app.listen(3000, () => console.log("running and listening at 3000"));
})
        .catch((err) => console.log("db cannot be connected"))


