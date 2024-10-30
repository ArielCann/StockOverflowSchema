import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = new Schema({
    UserID: {
        type: Number,
        required: true
    },
    email: {
        type:String,
        required:true
    },
    ProfileDesc: String,
    Password: {
        type: String,
        required: true
    },
    Username: {
        type: String,
        required: true
    },
    Signup: {
        type: Date,
        required: true
    },
    followedStocks: [stockSchema],
    likedMessages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
    dislikedMessages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
})