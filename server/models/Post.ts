import { Schema, model, Document, Model } from 'mongoose';

const postSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    category: { type: String, required: true, index: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: { virtuals: true }
});

postSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export const PostModel = model('Post', postSchema);