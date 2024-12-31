import mongoose from "mongoose";
import Message from "./messageSchema";
import ProfileImage from "./imageSchema";
interface IAccount extends Document {
    _id: mongoose.Types.ObjectId;
    Email: String;
    Password: string;
    ProfileDesc: String;
    Username: String;
    Signup: Date;
    FollowedStocks: Map<String,String>;
    RecieveStockNewsNotifications: Boolean;
    RecieveResponseNotifications: Boolean;
    RecieveLikedNotifications: Boolean;
    verificationNumber: string,
    Birthday: Date,
    verificationExpiration: Date,
    LikedDislikedMessages: Map<String,Boolean>;
    ProfileImage: mongoose.Types.ObjectId;
    PhoneNumber: String;
    setPhoneNumber(phone: String): Boolean;
    setProfileImage(image: Buffer, contentType: String): Promise<boolean>;
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
        required:true,
        unique:true,
    },
    PhoneNumber: String,
    ProfileDesc: String,
    Password: {
        type: String,
        required: true
    },
    Birthday: {type: Date},
    verificationNumber: {type: String},
    verificationExpiration: {type: Date},
    Username: {
        type: String,
        required: true,
        unique: true,
    },
    Signup: {
        type: Date,
        required: true
    },
    FollowedStocks: {
        type: Map,
        of: String
    },
    RecieveStockNewsNotifications: {
        type: Boolean,
        default: false
    },
    RecieveResponseNotifications: {
        type: Boolean,
        default: false
    },
    RecieveLikedNotifications: {
        type: Boolean,
        default: false
    },
    LikedDislikedMessages: {
        type: Map,
        of: Boolean,
        default: new Map(),
    },
    ProfileImage: mongoose.Types.ObjectId,
});
/**
 * Makes a user follow a specified stock
 * @param name the name of the stock
 * @param ticker the ticker of the stock
 * @return true if the user wasn't already following that stock, false otherwise.
 */
accountSchema.methods.addFollowedStock = function(name: String,ticker:String): boolean{
    if(this.FollowedStocks.has(ticker.toString().toUpperCase)){
        return false;
    }
    this.FollowedStocks.set(ticker.toString().toUpperCase(), name);
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
    if(this.FollowedStocks.has(ticker.toString().toUpperCase())){
        this.FollowedStocks.delete(ticker.toString().toUpperCase());
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
    if (this.LikedDislikedMessages.has(message.toString())) {
        return false;
    } else {
        this.LikedDislikedMessages.set(message.toString(), true);
        const messageObj = await Message.findById(message).exec()
        await messageObj?.like();
        await this.save();
        return true;
    }
}
/**
 * Sets an Account to dislike a message if not already liking or disliking it, also incrementing its number of dislikes.
 * @param message the mongoose object id of the message to be disliked.
 * @return true if the message was successfully disliked, false if it was already liked or disliked
 */
accountSchema.methods.dislikeMessage = async function(message: mongoose.Types.ObjectId): Promise<boolean> {
    if (this.LikedDislikedMessages.has(message.toString())) {
        return false;
    }
    else{
        this.LikedDislikedMessages.set(message.toString(),false);
        const messageObj = await Message.findById(message).exec()
        await messageObj?.dislike();
        await this.save();
        return true;
    }
}
/**
 * Removes a message from the user, setting them to no longer like or dislike it
 * and changing the message's number of likes or dislikes accordingly
 * @param message The message to be removed.
 */
accountSchema.methods.removeMessage = async function(message: mongoose.Types.ObjectId): Promise<boolean> {
    if (this.LikedDislikedMessages.has(message.toString())) {
        const liked = this.LikedDislikedMessages.get(message.toString());
        const messageObj = await Message.findById(message).exec();
        if(liked == true){
            await messageObj?.unlike();
            this.LikedDislikedMessages.delete(message.toString());
            await this.save();
        }
        else{
            await messageObj?.un_dislike();
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
accountSchema.methods.setProfileImage = async function(image: Buffer, contentType: String){
    const img = {
        imageData: image,
        contentType: contentType,
    }
    if(this.ProfileImage) {
        let profImage = await ProfileImage.findById(this.profileImage).exec();
        profImage?.overwrite(img);
        profImage?.save();
        this.ProfileImage = profImage?._id;
    }
    else{
        let saved = true;
        let profImage = new ProfileImage(img);
        await profImage.save().catch((error)=>{
            saved = false;
            console.error(error);
        });
        if(saved) {
            this.ProfileImage = profImage._id;
            this.save();
            return true;
        }
        else{
            return false;
        }
    }
}
accountSchema.methods.setPhoneNumber = function(phone: string){
    this.phoneNumber = phone;
    this.save();
    return true;
}

const Account = mongoose.model("accounts", accountSchema);

export default Account;