import mongoose from 'mongoose';
const { Schema } = mongoose;
const  messageSchema = new Schema({
    MessageID: {
        type: Number,
        required: true,
    },
    UserID: Number,
    date: Date,
    RepliedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    Replies: [messageSchema]
})
const userSchema = new Schema({
    UserID: Number,
    email: {
        type:String,
        required:true
    },
    ProfileDesc: String,
    Password: String,
    Username: String,
    Signup: Date,
})
const stockSchema = new Schema({
    UserID: {
        type: Number,
        required: true
    },
    Ticker: {
        type: String,
        required: true
    }
})