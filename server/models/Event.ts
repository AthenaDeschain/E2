import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isOnline: { type: Boolean, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            ret.date = ret.date.toISOString();
        }
    },
    toObject: { virtuals: true }
});

eventSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export const EventModel = model('Event', eventSchema);