const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({

    // sender (logged in via token decoded)
    fromUserId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    // receiver
    toUserId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    status: {
        // enum == restrict user for certain values like roles like array
        required: true,
        type: String, // string VALUE in enum
        enum: {
            values: ["ignore", "interested", "accepted", "rejected"],
            message: `{ VALUE } is incorrect status type`
        }
    }
}, {
    timestamps: true
});

// ConnectionRequest.fing({fromuserId: 87yehfr983hyefr})
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

/*
    connectionRequestSchema.index(
    { fromUserId: 1, toUserId: 1 },
    { unique: true }
);
*/

// middleware to attach before event
connectionRequestSchema.pre("save", function(next) {
    const connectionRequest = this;

    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error ("cannot send connection request to yourself");
    }
    next();
})

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = { ConnectionRequest }
