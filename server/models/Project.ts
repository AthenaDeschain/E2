import { Schema, model } from 'mongoose';

const projectMemberSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectRole: { type: String, required: true, enum: ['Lead', 'Collaborator', 'Advisor'] }
}, { _id: false });

const projectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, enum: ['Recruiting', 'In Progress', 'Completed'] },
    progress: Number,
    isSeekingFunding: { type: Boolean, required: true },
    seekingCivilianScientists: { type: Boolean, required: true },
    members: [projectMemberSchema],
    tags: [String]
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: { virtuals: true }
});

projectSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export const ProjectModel = model('Project', projectSchema);