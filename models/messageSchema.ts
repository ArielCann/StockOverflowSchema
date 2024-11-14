import mongoose from "mongoose";
const  messageSchema = new mongoose.Schema({
    MessageID: {
        type: Number,
        required: true,
    },
    Text: String,
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    Date_created: {
        type: Date,
        required: true
    },
    Likes: Number,
    Dislikes: Number,
    IsQuery: {
        type: Boolean,
        required: true
    },
    RepliedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    Replies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
})
messageSchema.methods.like = function(){
    this.Likes += 1;
}
messageSchema.methods.dislike = function(){
    this.Dislikes += 1;
}
const Message = mongoose.model("Message", messageSchema);
export default Message;