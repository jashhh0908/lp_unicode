import userModel from "../model/userModel.js";

async function createUser(req, res) {
    try {
        const newUser = await userModel.create(req.body);
        res.status(201).json({
            message: "User created successfully",
            newUser
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to add user" });
    }
};

async function getUser(req, res) {
    try {
        const userData = await userModel.find();
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: "Database error! "});
    }
};


export { createUser, getUser };