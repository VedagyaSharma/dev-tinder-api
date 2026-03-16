const mongoose = require('mongoose');

const connectDB = async () => { // cluster connected - /name connects db
    await mongoose.connect("mongodb+srv://vedagyasharma_db_user:b8yGpqQByZtVJutE@namastenode.mvbbteq.mongodb.net/devTinder");
}

module.exports = {connectDB}

