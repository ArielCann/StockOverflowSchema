import mongoose from "mongoose";
const accountSchema = new mongoose.Schema({
    AccountID: {
        type: Number,
        required: true
    },
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
accountSchema.methods.addFollowedStock = function(name: String,ticker:String): boolean{
    if(this.followedStocks.has(name)){
        return false;
    }
    this.followedStocks.set(name,ticker);
    return true;
}
/**
 * Makes a user stop following the specified stock
 * @param name the name of the stock
 */
accountSchema.methods.removeFollowedStock = function(name: String): boolean{
    if(this.followedStocks.has(name)){
        this.followedStocks.delete(name);
        return true;
    }
    return false;
}
export default Account;