const express = require('express');
const app = express();
const {connectDB} = require('./config/database');
const { User } = require("./models/user");
const {validateSingupData} = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middlewares/auth');

app.use(express.json());
app.use(cookieParser());

// sample signup
app.post("/signup", async (req, res) => {
console.log(req.body); // from raw postman

// await User.create(req.body);
    // const userObj = {
    //     firstName: "Ronaldo",
    //     lastName: "McCullum",
    //     emailId: "rm@sharma.com",
    //     password: "rm@123",
    //     age: 26
    // }

    try {
        // validation of data from req.body
        validateSingupData(req);

        // encrypt pw and then store in db
        const {password, firstName, lastName, emailId, age} = req.body;
        const saltRounds = 10; // 10 to 12
        const passwordHash = await bcrypt.hash(password, saltRounds); 
        console.log(passwordHash);

        // creating a new instance of user model 
        const user = new User({
            firstName, lastName, emailId, password: passwordHash, age
        }); // req.body can be corrupted

        await user.save();
        res.status(201).json("user inserted successfully")
    } catch (error) {
        res.status(400).json("error saving user data : " + error.message);
    }
});

// login
app.post("/login", async (req, res) => {
    try {
        // validateSingupData(req); -> will check everything
        // console.log(req.body.emailId);
        const {emailId, password} = req.body;
        
        const user = await User.findOne({ emailId }).select("+password");
        // console.log("login user mail find -- ", user);
        if(!user) {
            throw new Error ("email ID is not present");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValidFromMethod = await user.validatePassword();

        if(isPasswordValid) {

            // Create a JWT Access Token
            const tokenFromMethod = await user.getJWT();
            // hiding userId under this token
            const token = jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
                expiresIn: "3d" });
            console.log(token);

            // Refresh Token??

            // Add the token to cookie and send the response back to user
            res.cookie("token", token, { httpOnly: true, expires: 
                new Date(Date.now() + 8 * 3600000) // expires in 8 hours
            }); // secure: true, sameSite: "stict"

            res.status(200).json({ message: "Login successful" });
        }
        else {
            throw new Error("Password or email incorrect")
        }

    } catch (error) {
        res.status(400).send("ERROR " + error.message);
    }
});

// cookie use api 
app.get("/profile", userAuth, async (req, res) => { // next() in userAuth(user attached) will run this (req, res) => {}

    try {
        const user = req.user;
        res.send("real cookie user -- " + user);
    } catch (error) {
        res.status(400).send("ERROR -- ", error.message);
    }

});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    try {
        const user = req.user;
        // sending a connection request
        res.send(user.firstName + " sent a connection request");
    } catch (error) {
        
    }
})

//  // Get user by email
// app.get("/user", async (req, res) => {
//     const userEmail = req.body.emailId;
//     // console.log(userEmail);
//     try {
//         const user = await User.find({emailId: userEmail});
//         if(user.length === 0) {
//             res.status(404).send("User not found");
//         }
//         else {
//             res.send(user);
//         }
//     } catch (err) {
//         res.status(400).json("error fething user data : " + err.message);
//     }

//     console.log()
// })

// // feed API
// app.get("/feed", async (req, res) => {
//     try {
//         const users = await User.find({});
//         res.send(users);
//     } catch (error) {
//         res.status(400).json("error fething users data : " + error.message);
        
//     }
// })

// // delete by Id
// app.delete("/user", async (req, res) => {
//     try {
//         const userId = req.body.userId;
//         console.log(userId);
//         await User.findByIdAndDelete({ _id : userId });
//         res.send("user deleted successfully")
//     } catch (error) {
//         res.status(400).json("error deleting user (by id) data : " + error.message);
        
//     }
// })

// // update data of the user
// app.patch("/user", async (req, res) => {
//     const userId = req.body.userId;
//     const data = req.body; // whole entry - doc

    
//     try {
//         const ALLOWED_UPDATES = [
//             "photoUrl", "about", "gender", "userId", "skills"
//         ];

//         const isUpdateAllowed = Object.keys(data).every((key) => 
//             ALLOWED_UPDATES.includes(key)
//         );
    
//         if(!isUpdateAllowed) {
//             throw new Error("not allowed to update");
//         }

//         if(data?.skills.length > 10) {
//             throw new Error("max skills selected already");
//         }

//         await User.findByIdAndUpdate({ _id: userId }, data, {runValidators: true});
//         res.send("user updated successfully");
//     } catch (error) {
//         res.status(400).json("error updating user (by id) data : " + error.message);
//     }
// })

connectDB().then(() => {
    console.log("db connected successfully")
    app.listen(3000, () => console.log("running and listening at 3000"));
})
        .catch((err) => console.log("db cannot be connected"))


