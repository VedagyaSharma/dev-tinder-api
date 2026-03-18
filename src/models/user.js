const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// make schema and then export the model

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 4,
        maxLength: 50
    },
    emailId: {
        type: String,
        required: true,
        unique: true,      // prevents duplicate emails
        index: true,
        lowercase: true,   // normalize emails
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error ("invalid email")
            }
        }
        // match using joi or regex or validator.js
    },
    password: {
        type: String,
        required: true,
        select: false, // when db ops use .select("+passsword") to add otherwise stays hidden
        minLength: 8,
        validate(value) {
            if(!validator.isStrongPassword(value)) { // one cap one small one symbol one num
                throw new Error ("enter strong password")
            }
        }
    },
    age: {
        type:Number,
        required: true,
        min: 18,
        max: 150
    },
    gender: {
        type: String,
        validate(value) { // explicitely call this with options runValidator (only runs in .save() by default) in API
            if( !["male", "females", "other"].includes(value) ) {
                throw new Error ("Gender data is not valid")
            }
        },
    },
    photoUrl: {
        type: String,
        default: "https://www.bing.com/images/search?view=detailV2&ccid=rcmXeqCU&id=390268BEF87BCF1CF49DBCA55A8CF0829E6E62A4&thid=OIP.rcmXeqCUOiCg54dfU4v9tgHaHa&mediaurl=https%3a%2f%2fcdn.pixabay.com%2fphoto%2f2020%2f07%2f01%2f12%2f58%2ficon-5359553_1280.png&exph=1280&expw=1280&q=dummy+user+full+photo+image&FORM=IRPRST&ck=8079AE58CD1E6E151B8C3C6093229F70&selectedIndex=0&itb=1&idpp=overlayview&ajaxhist=0&ajaxserp=0",
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error ("invalid photoUrl")
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about of the user!"
    },
    skills: {
        type: [String]
    }
    // roles: {
    //     enum: ["user"],
    //     default: "user"
    // }
},
{
    timestamps: true,
    versionKey: false // __v field
}
);

userSchema.methods.getJWT = function () {
    const user = this; // arrow function does not have their own this

    const token = jwt.sign({ _id: userSchema._id }, "DEV@Tinder$790", {
        expiresIn: "3d"
    });
    return token;
}

userSchema.methods.validatePassword = async function (pwInputByUser) {
    const user = this;
    const passwordHash = user.password; // obv pw are stored in hash
    const isPasswordValid = await bcrypt.compare(pwInputByUser, passwordHash);

    return isPasswordValid;
}

// database = devTinder, collection - User, entries/rows = documents

const User = mongoose.model("User", userSchema);
module.exports = { User }