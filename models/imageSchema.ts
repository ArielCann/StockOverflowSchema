import mongoose from "mongoose";

interface IProfileImage extends Document {
    _id: mongoose.Types.ObjectId,
    imageType: String,
    imageData: Buffer
}
const imageSchema = new mongoose.Schema<IProfileImage>({
    _id: mongoose.Types.ObjectId,
    imageType: String,
    imageData: Buffer
})
const ProfileImage = mongoose.model("ProfileImage", imageSchema);
export default ProfileImage