import userModel from "../model/userModel.js";
import logger from "../config/logger.js";
import bcrypt from 'bcrypt';

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
        logger.info(`User created successfully: ${registerUser._id}`);
        res.status(201).json(registerUser);
    } catch (error) {
        next(error);
    }
}

export {
    register
}