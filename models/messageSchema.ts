import mongoose from "mongoose";
interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    Text: string;
    Account: mongoose.Types.ObjectId;
    Date_Created: Date;
    Likes: Number;
    Dislikes: Number;
    IsQuestion: Boolean;
    RepliedTo: mongoose.Types.ObjectId;
    Replies: Array<mongoose.Types.ObjectId>;
    like(): Boolean;
    dislike(): Boolean;
    unlike(): Boolean;
    un_dislike(): Boolean;
    addReply(message: mongoose.Types.ObjectId): Promise<Boolean>;
}
const  messageSchema = new mongoose.Schema<IMessage>({
    Text: String,
    Account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    Date_Created: {
        type: Date,
        required: true
    },
    Likes: Number,
    Dislikes: Number,
    IsQuestion: {
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
    this.save();
}
messageSchema.methods.unlike = function(){
    this.Likes -= 1;
    this.save();
}

messageSchema.methods.dislike = function(){
    this.Dislikes += 1;
    this.save();
}
messageSchema.methods.un_dislike = function(){
    this.Dislikes -= 1;
    this.save();
}
messageSchema.methods.addReply = async function(reply_id: mongoose.Schema.Types.ObjectId){
    const oldSize = this.Replies.length;
    this.Replies.addToSet([reply_id]);
    if(this.Replies.length > oldSize){
        await this.save();
        return true;
    }
    return false;
}
const Message = mongoose.model("Message", messageSchema);
export default Message;
export type {IMessage};