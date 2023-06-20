const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            maxlength: 32,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            index: { unique: true },
        },
        password: {
            type: String,
            required: true,
        },
        userRole: {
            type: Number,
            required: true,
            default: 3
        },
        phoneNumber: {
            type: Number,
            required: true,
        },
        subscribed: {
            type: Boolean,
            default: false
        },
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
