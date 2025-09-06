import userModel from "../model/userModel.js";
import logger from "../config/logger.js";

async function createUser(req, res) {
    try {
        const newUser = await userModel.create(req.body);
        logger.info(`User created successfully: ${newUser._id}`);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

async function getUser(req, res) {
    try {
        const userData = await userModel.find();
        logger.info(`${userData.length} users fetched`);
        res.status(200).json(userData);
    } catch (error) {
        next(error);
    }
};

async function updateUser(req, res) {
    try {
        const userID = req.params.id;
        const updatedUser = await userModel.findOneAndUpdate(
            { id: userID},
            req.body,
            { new: true, overwrite: true }
        );
        if(!updatedUser){
            logger.warn(`User not found!`)
            return res.status(404).json({ message: "User not updated" });
        }
        else{
            logger.info(`User updated: ${updatedUser._id}`)
            return res.status(200).json(updatedUser);
        }
    } catch (error) {
        next(error);
    }
};

async function deleteUser(req, res) {
    try{
        const userID = req.params.id;
        const deletedUser = await userModel.findOneAndDelete(
            { id: userID }
        );
        if(!deletedUser){
            logger.warn(`User email ${user_email} not found!`)
            return res.status(404).json({ message: "User not deleted!" });
        }
        else{
            logger.info(`User deleted" ${deletedUser._id}`);
            return res.status(200).json({ message: "User successfully deleted" });
        }
    } catch (error) {
        next(error);
    }
};

export {
    createUser, 
    getUser, 
    updateUser, 
    deleteUser 
};