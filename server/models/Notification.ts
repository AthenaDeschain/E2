import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['like', 'comment', 'mention', 'project_invite'] },
    content: { type: String, required: true },
    link: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            ret.timestamp = ret.timestamp.toISOString();
        }
    },
    toObject: { virtuals: true }
});

notificationSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export const NotificationModel = model('Notification', notificationSchema);