import mongoose from "mongoose";
const accountSchema = new mongoose.Schema({
    AccountID: {
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
    followedStocks: {
      type: Map,
      of: String
    },
    recieveEmailNotifications: Boolean,
    recieveSMSNotifications: Boolean,
    recieveResponseNotifications: Boolean,
    recieveLikedNotifications: Boolean,
    LikedDislikedMessages: {
        type: Map,
        of: Boolean
    }
});

const User = mongoose.model("Account", accountSchema);
accountSchema.methods.addFollowedStock = function(name: String,ticker:String): boolean{
    if(this.followedStocks.has(name)){
        return false;
    }
    this.followedStocks.set(name,ticker);
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
        return true;
    }
    return false;
}
export default User;