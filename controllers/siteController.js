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

async function updateUser(req, res) {
    try {
        const user_email = req.params.email;
        const updatedUser = await userModel.findOneAndUpdate(
            { email: user_email},
            req.body,
            { new: true, overwrite: true }
        );
        if(!updatedUser)
            return res.status(404).json({ message: "User not updated" });
        else
            return res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Database error!" });
    }
};

export { createUser, getUser, updateUser };