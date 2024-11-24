import mongoose, {Mongoose} from "mongoose";
import Message from "./messageSchema";
interface IAccount extends Document {
    _id: mongoose.Types.ObjectId;
    Email: String,
    Password: String
    ProfileDesc: String;
    Username: String;
    Signup: Date;
    FollowedStocks: Map<String,String>;
    RecieveEmailNotifications: Boolean;
    RecieveSMSNotifications: Boolean;
    RecieveResponseNotifications: Boolean;
    RecieveLikedNotifications: Boolean;
    LikedDislikedMessages: Map<String,Boolean>;

    /**
     * Makes a user follow a specified stock
     * @param name the name of the stock
     * @param ticker the ticker of the stock
     * @return true if the user wasn't already following that stock, false otherwise.
     */
    addFollowedStock(name: String, ticker: String): boolean;
    /**
     * Makes a user stop following the specified
     * @param name the name of the stock
     * @param ticker the ticker of the stock
     * @return true if the user had been following that stock, false otherwise.
     */
    removeFollowedStock(name: String, ticker: String): boolean;
    /**
     * Changes profile description to the specified string.
     * @param newDesc the new profile description
     */
    alterProfileDesc(newDesc: String): void;
    /**
     * Sets an Account to like a message if not already liking or disliking it, also incrementing its number of likes.
     * @param message the mongoose object id of the message to be liked.
     * @return true if the message was successfully liked, false if it was already liked or disliked
     */
    likeMessage(message: mongoose.Types.ObjectId): Promise<boolean>;
    /**
     * Sets an Account to dislike a message if not already liking or disliking it, also incrementing its number of dislikes.
     * @param message the mongoose object id of the message to be disliked.
     * @return true if the message was successfully disliked, false if it was already liked or disliked
     */
    dislikeMessage(message: mongoose.Types.ObjectId): Promise<boolean>;
    /**
     * Removes a message from the user, setting them to no longer like or dislike it
     * and changing the message's number of likes or dislikes accordingly
     * @param message The message to be removed.
     */
    removeMessage(message: mongoose.Types.ObjectId): Promise<boolean>;
    /**
     * If the Account is not already set to receive notifications through email,
     * this method will set them to receive emails and return true.
     * Otherwise, it will return false.
     */
    yesEmail(): boolean;
    /**
     * If the Account is  set to receive notifications through email,
     * this method will set them to not receive emails and return true.
     * Otherwise, it will return false.
     */
    noEmail(): boolean;
    /**
     * If the Account is not already set to receive notifications through SMS,
     * this method will set them to receive SMS messages and return true.
     * Otherwise, it will return false.
     */
    yesSMS(): boolean;
    /**
     * If the Account is  set to receive notifications through SMS,
     * this method will set them to not receive texts and return true.
     * Otherwise, it will return false.
     */
    noSMS(): boolean;
    /**
     * If the Account is not already set to receive response notifications,
     * this method will set them to receive such notifications and return true.
     * Otherwise, it will return false.
     */
    yesResponseNotifications(): boolean;
    /**
     * If the Account is  set to receive response notifications,
     * this method will set them to not receive such notifications and return true.
     * Otherwise, it will return false.
     */
    noResponseNotifications(): boolean;
    /**
     * If the Account is not already set to receive liked notifications,
     * this method will set them to receive such notifications and return true.
     * Otherwise, it will return false.
     */
    yesLikedNotifications(): boolean;
    /**
     * If the Account is  set to receive liked notifications,
     * this method will set them to not receive such notifications and return true.
     * Otherwise, it will return false.
     */
    noLikedNotifications(): boolean;

}
const accountSchema = new mongoose.Schema<IAccount>({
    Email: {
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
    FollowedStocks: {
        type: Map,
        of: String
    },
    RecieveEmailNotifications: Boolean,
    RecieveSMSNotifications: Boolean,
    RecieveResponseNotifications: Boolean,
    RecieveLikedNotifications: Boolean,
    LikedDislikedMessages: {
        type: Map,
        of: Boolean
    }
});
/**
 * Makes a user follow a specified stock
 * @param name the name of the stock
 * @param ticker the ticker of the stock
 * @return true if the user wasn't already following that stock, false otherwise.
 */
accountSchema.methods.addFollowedStock = function(name: String,ticker:String): boolean{
    if(this.followedStocks.has(name)){
        return false;
    }
    this.followedStocks.set(name,ticker);
    this.save();
    return true;
}
/**
 * Makes a user stop following the specified
 * @param name the name of the stock
 * @param ticker the ticker of the stock
 * @return true if the user had been following that stock, false otherwise.
 */
accountSchema.methods.removeFollowedStock = function(name: String,ticker:String): boolean{
    if(this.followedStocks.has(name)){
        this.followedStocks.delete(name);
        this.save();
        return true;
    }
    return false;
}
/**
 * Changes profile description to the specified string.
 * @param newDesc the new profile description
 */
accountSchema.methods.alterProfileDesc = function(newDesc: string){
    this.ProfileDesc = newDesc;
    this.save();
}
/**
 * Sets an Account to like a message if not already liking or disliking it, also incrementing its number of likes.
 * @param message the mongoose object id of the message to be liked.
 * @return true if the message was successfully liked, false if it was already liked or disliked
 */
accountSchema.methods.likeMessage = async function (message: mongoose.Types.ObjectId): Promise<boolean> {
    if (message.toString() in this.LikedDislikedMessages) {
        return false;
    } else {
        this.LikedDislikedMessages.put(message.toString(), true);
        const messageObj = await Message.findById(message).exec()
        messageObj?.like();
        messageObj?.save();
        this.save();
        return true;
    }
}
/**
 * Sets an Account to dislike a message if not already liking or disliking it, also incrementing its number of dislikes.
 * @param message the mongoose object id of the message to be disliked.
 * @return true if the message was successfully disliked, false if it was already liked or disliked
 */
accountSchema.methods.dislikeMessage = async function(message: mongoose.Types.ObjectId): Promise<boolean> {
    if(message.toString() in this.LikedDislikedMessages){
        return false;
    }
    else{
        this.LikedDislikedMessages.put(message.toString(),false);
        const messageObj = await Message.findById(message).exec()
        messageObj?.dislike();
        messageObj?.save();
        this.save();
        return true;
    }
}
/**
 * Removes a message from the user, setting them to no longer like or dislike it
 * and changing the message's number of likes or dislikes accordingly
 * @param message The message to be removed.
 */
accountSchema.methods.removeMessage = async function(message: mongoose.Types.ObjectId): Promise<boolean> {
    if(message.toString() in this.LikedDislikedMessages){
        const liked = this.LikedDislikedMessages[message.toString()];
        const messageObj = await Message.findById(message).exec();
        if(liked){
            messageObj?.unlike();
            messageObj?.save();
            this.LikedDislikedMessages.delete(message.toString());
            this.save();
        }
        else{
            messageObj?.un_dislike();
            messageObj?.save();
            this.LikedDislikedMessages.delete(message.toString());
            this.save();
        }
        return true;
    }
    return false;
}
//boolean notification setters
/**
 * If the Account is not already set to receive notifications through email,
 * this method will set them to receive emails and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.yesEmail = function(){
    if(!this.receiveEmailNotifications) {
        this.RecieveEmailNotifications = true;
        this.save();
        return true;
    }
    return false;
}
/**
 * If the Account is  set to receive notifications through email,
 * this method will set them to not receive emails and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.noEmail = function(){
    if(this.RecieveEmailNotifications) {
        this.RecieveEmailNotifications = false;
        this.save();
        return true;
    }
    return false;
}
/**
 * If the Account is not already set to receive notifications through SMS,
 * this method will set them to receive SMS messages and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.yesSMS = function(){
    if(!this.receiveSMSNotifications) {
        this.RecieveSMSNotifications = true;
        this.save();
        return true;
    }
    return false;
}
/**
 * If the Account is  set to receive notifications through SMS,
 * this method will set them to not receive texts and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.noSMS = function() {
    if (this.RecieveSMSNotifications) {
        this.RecieveSMSNotifications = false;
        this.save();
        return true;
    }
    return false;
}
/**
 * If the Account is not already set to receive response notifications,
 * this method will set them to receive such notifications and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.yesResponseNotifications = function(){
    if((this.ReceiveSMSNotifications || this.ReceiveEmailNotifications) && !this.RecieveResponseNotifications) {
        this.RecieveResponseNotifications = true;
        this.save();
        return true;
    }
    return false;
}
/**
 * If the Account is  set to receive response notifications,
 * this method will set them to not receive such notifications and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.noResponseNotifications = function(){
    if(this.RecieveResponseNotifications) {
        this.RecieveResponseNotifications = false;
        this.save();
        return true;
    }
    return false;
}
/**
 * If the Account is not already set to receive liked notifications,
 * this method will set them to receive such notifications and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.yesLikedNotifications = function(){
    if((this.ReceiveSMSNotifications || this.ReceiveEmailNotifications) && !this.ReceiveLikedNotifications) {
        this.RecieveLikedNotifications = true;
        this.save();
        return true;
    }
    return false;
}
/**
 * If the Account is  set to receive liked notifications,
 * this method will set them to not receive such notifications and return true.
 * Otherwise, it will return false.
 */
accountSchema.methods.noLikedNotifications = function(){
    if(this.ReceiveLikedNotifications) {
        this.RecieveLikedNotifications = false;
        this.save();
        return true;
    }
    return false;
}

const Account = mongoose.model("Account", accountSchema);

export default Account;