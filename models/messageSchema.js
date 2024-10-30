import mongoose from "mongoose";
const { Schema } = mongoose;
const  messageSchema = new Schema({
    MessageID: {
        type: Number,
        required: true,
    },
    text: String,
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date_created: {
        type: Date,
        required: true
    },
    likes: Number,
    dislikes: Number,
    isQuery: {
        type: Boolean,
        required: true
    },
    RepliedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    Replies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
})
