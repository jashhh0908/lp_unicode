import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    content: {
        type: Object,
        required: true
    },
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
    }
});

const versionModel = mongoose.model("Version", versionSchema);

export default versionModel;