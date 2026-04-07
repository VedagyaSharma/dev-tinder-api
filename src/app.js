require('dotenv').config();
const express = require('express');
const app = express();
const { connectDB } = require('./config/database');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const { authRouter} = require('./routes/auth');
const { requestsRouter } = require('./routes/requests');
const { profileRouter } = require('./routes/profile');
const { userRouter } = require('./routes/user');

app.use('/', authRouter);
app.use('/', requestsRouter);
app.use('/', profileRouter);
app.use('/', userRouter);

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


