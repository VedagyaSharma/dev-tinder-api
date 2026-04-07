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
// atomic upsert can still race without a unique index under extreme concurrency
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

/*
    connectionRequestSchema.index(
    { fromUserId: 1, toUserId: 1 },
    { unique: true }
);
*/

// middleware to attach before event
connectionRequestSchema.pre("save", async function() {
    // console.log("pre ran in connectionRequest and next is a", typeof next);
    // ❌ Never mix next() + throw ✅ Pick ONE style
    const connectionRequest = this;

    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error ("cannot send connection request to yourself");
    }
    // next();
})

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = { ConnectionRequest }
/*
    You’re mixing behavior:

Using function(next)
But throwing error instead of calling next(err)

👉 This confuses Mongoose internals
👉 next becomes corrupted / not a function
👉 bubbles up as next is not a function
*/