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
        required: true,
        index: true
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