const express = require('express');
const app = express();
const {connectDB} = require('./config/database');
const {User} = require("./models/user");
const { get } = require('mongoose');

app.use(express.json());

// sample signup
app.post("/signup", async (req, res) => {
console.log(req.body); // from raw postman
// await User.create(req.body);
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
        res.status(400).json("error saving user data : " + error.message);
    }
});

 // Get user by email
app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;
    // console.log(userEmail);
    try {
        const user = await User.find({emailId: userEmail});
        if(user.length === 0) {
            res.status(404).send("User not found");
        }
        else {
            res.send(user);
        }
    } catch (err) {
        res.status(400).json("error fething user data : " + err.message);
    }

    console.log()
})

// feed API
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(400).json("error fething users data : " + error.message);
        
    }
})

// delete by Id
app.delete("/user", async (req, res) => {
    try {
        const userId = req.body.userId;
        console.log(userId);
        await User.findByIdAndDelete({ _id : userId });
        res.send("user deleted successfully")
    } catch (error) {
        res.status(400).json("error deleting user (by id) data : " + error.message);
        
    }
})

// update data of the user
app.patch("/user", async (req, res) => {
    const userId = req.body.userId;
    const data = req.body; // whole entry - doc
    try {
        await User.findByIdAndUpdate({ _id: userId }, data, {runValidators: true});
        res.send("user updated successfully");
    } catch (error) {
        res.status(400).json("error updating user (by id) data : " + error.message);
    }
})

connectDB().then(() => {
    console.log("db connected successfully")
    app.listen(3000, () => console.log("running and listening at 3000"));
})
        .catch((err) => console.log("db cannot be connected"))


