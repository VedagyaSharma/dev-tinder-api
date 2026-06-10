const mongoose = require("mongoose");

const connectDB = async () => {

        console.log("Inside connectDB Function");

        await mongoose.connect(
            "mongodb+srv://vedagyasharma_db_user:b8yGpqQByZtVJutE@namastenode.mvbbteq.mongodb.net/devTinder"
        );

        console.log("MongoDB Connected Successfully");
};

module.exports = { connectDB };

// mongodb+srv://vedagyasharma_db_user:b8yGpqQByZtVJutE@namastenode.mvbbteq.mongodb.net/devTinder