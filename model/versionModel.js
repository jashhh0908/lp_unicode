import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    versions: [
        {
            versionNumber: {
                type: Number,
                required: true
            },
            editedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            editedAt: {
                type: Date,
                default: Date.now
            },
            content: {
                title: String,
                content: String
            },
        },
    ]
});

const versionModel = mongoose.model("Version", versionSchema);

export default versionModel;