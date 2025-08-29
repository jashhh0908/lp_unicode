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

export { createUser };