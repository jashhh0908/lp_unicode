import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,  
        required: true
    },
    email: { 
        type: String,
        unique: true,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    credit_scores: {
        type: Number,
        required: true
    }
},
{
    timestamps: true,
});

const userModel = mongoose.model("user", userSchema);

export default userModel;