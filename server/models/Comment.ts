import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
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

commentSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export const CommentModel = model('Comment', commentSchema);