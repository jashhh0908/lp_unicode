import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    access: {
        view: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        edit: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }]
    },
    requests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        type: {
            type: String,
            enum: ['view', 'edit'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    }]
});

const DocumentModel = mongoose.model('document', DocumentSchema);
export default DocumentModel;