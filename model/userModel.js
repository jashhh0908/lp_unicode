import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    dob: Date,
    credit_scores: Number,
},
{
    timestamps: true,
});

const userModel = mongoose.model("user", userSchema);

export default userModel;