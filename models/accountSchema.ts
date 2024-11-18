import mongoose from "mongoose";
const accountSchema = new mongoose.Schema({
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

const Account = mongoose.model("Account", accountSchema);
/**
 * Makes a user follow a specified stock
 * @param name the name of the stock
 * @param ticker the ticker of the stock
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
 */
accountSchema.methods.removeFollowedStock = function(name: String,ticker:String): boolean{
    if(this.followedStocks.has(name)){
        this.followedStocks.delete(name);
        this.save();
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
accountSchema.methods.alterProfileDesc = function(newDesc: string){
    this.ProfileDesc = newDesc;
}
export default Account;