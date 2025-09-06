import userModel from "../model/userModel.js";
import logger from "../config/logger.js";
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
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

        const accessToken = generateAccessToken(registerUser._id);
        const refreshToken = generateRefreshToken(registerUser._id);

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
        
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({ 
            message: "Login successful",
            token: accessToken 
        });
    } catch (error) {
        next(error);
    }
}

export {
    register,
    login
}