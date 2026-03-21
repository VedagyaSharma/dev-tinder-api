const validator = require('validator');

const validateSingupData = (req) => {
    const body = req.body;

    if(body.firstName && body.firstName.length < 4) {
        throw new Error("First name must be at least 4 characters");
    }

    if(body.lastName && body.lastName.length < 4) {
        throw new Error("Last name must be at least 4 characters");
    }

    if(!validator.isEmail(emailId)) {
        throw new Error ("email is not valid");
    }

    if(!validator.isStrongPassword(password)) {
        throw new Error ("pls enter a strong password");
    }

};

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "emailId", "photoUrl", "gender", "about", "skills", "age"];

    const isEditAllowed = Object.keys(req.body).every(field => { 
        return allowedEditFields.includes(field)
    });

    const body = req.body;

    if(body.firstName && body.firstName.length < 4) {
        throw new Error("First name must be at least 4 characters");
    }

    if(body.lastName && body.lastName.length < 4) {
        throw new Error("Last name must be at least 4 characters");
    }

    if(body.emailId && !validator.isEmail(body.emailId)) {
        throw new Error("Invalid email format");
    }

    if(body.photoUrl && !validator.isURL(body.photoUrl)) {
        throw new Error("Invalid photo URL");
    }

    if(body.age && (body.age < 18 || body.age > 150)) {
        throw new Error("Age must be between 18 and 150");
    }

    if (body.gender && !["male", "female", "other"].includes(body.gender)) {
        throw new Error("Invalid gender value");
    }

    if (body.skills && !Array.isArray(body.skills)) {
        throw new Error("Skills must be an array");
    }
        
    return isEditAllowed;
}

const validateNewPassword = (req) => {
    const newPassword = req.body.password;
    console.log(newPassword);
    if(!newPassword) {
        throw new Error ("new password needed");
    }

    if(!validator.isStrongPassword(newPassword)) {
        throw new Error ("pls enter a strong password");
    }

    return true;
}


module.exports = { validateSingupData, validateEditProfileData, validateNewPassword }