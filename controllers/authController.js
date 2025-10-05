import dotenv from 'dotenv';
dotenv.config();
import userModel from "../model/userModel.js";
import logger from "../config/logger.js";
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from 'jsonwebtoken';
import mail from "../utils/mailer.js";
import uploadToCloudinary from '../utils/cloudinary.js';
async function register(req, res, next) {
    try {
        const { name, email, dob, password, credit_scores } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(String(password), salt);
        const registerUser = await userModel.create({
            name,
            email,
            dob,
            password: hashedPass,
            credit_scores,
        })
    
        await mail(
            email,
            "Welcome to Unicode!",
            `<h1>Hello John</h1><p>Welcome to our app!</p>`,
            `Hello ${name}, welcome!`
        )

        const accessToken = generateAccessToken(registerUser._id);

        logger.info(`User created successfully: ${registerUser._id}`);
        res.status(201).json({
            message: "User registered successfully",
            token: accessToken,
            user: {
                id: registerUser._id,
                name: registerUser.name,
                email: registerUser.email
            }
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next){
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email })
        if(!user) 
            return res.status(400).json({ message: "Invalid email or password" })

        const pass_check = await bcrypt.compare(password, user.password);
        if(!pass_check) 
            return res.status(400).json({ message: "Invalid email or password!" })
        
        await sendMail(
            user.email,
            "Login Notification!", 
            `<p>Hello ${user.name},</p><p>You just logged in at ${new Date().toLocaleString()}</p>`,
            `Hello ${user.name}. You just logged in at ${new Date().toLocaleString()}`
        )
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7*24*60*60*1000 //expires in 1 week
        });
        res.status(200).json({ 
            message: "Login successful",
            token: accessToken,
            userInfo: {
                id: user._id,
                name: user.name,
                email: user.email
            } 
        });
    } catch (error) {
        next(error);
    }
}

async function refreshAccessToken (req, res, next) {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) 
            return res.status(401).json({ error: "NO refresh token provided" })

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (error, decoded) => {
            if(error)
                return res.status(401).json({ error: "Invalid refresh token" })

            const newAccessToken = generateAccessToken(decoded.id);

            res.status(200).json({
                message: "New access token generated",
                token: newAccessToken
            })
        })
    } catch (error) {
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        res.clearCookie("refreshToken")
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        next(error);
    }
}

async function uploadProfileImage(req, res, next) {
    try {
        const userID = req.user.id;
        if(!req.file)
            return res.status(400).json({ error: "Image file is required" });

        const uploaded = await uploadToCloudinary(req.file.path);
        if(!uploaded)
            return res.status(500).json({ error: "Cloundinary upload failed" });

        const updatedUser = await userModel.findByIdAndUpdate(userID, 
            { profile_image: uploaded.secure_url },
            { new: true }
        );

        res.status(200).json({
            message: "Profile image uploaded successfully",
            profile_image: updatedUser.profile_image
        });
    }
    catch (error) {
        next(error);
    }
}

export {
    register,
    login,
    refreshAccessToken,
    logout,
    uploadProfileImage
}