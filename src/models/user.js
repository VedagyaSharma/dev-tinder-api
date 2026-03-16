const mongoose = require('mongoose');
// make schema and then export the model

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    emailId: {
        type: String,
        unique: true,      // prevents duplicate emails
        index: true,
        lowercase: true,   // normalize emails
        trim: true
        // match using joi or regex
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type:Number,
        required: true
    },
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
// database = devTinder, collection - User, entries/rows = documents

const User = mongoose.model("User", userSchema);
module.exports = { User }