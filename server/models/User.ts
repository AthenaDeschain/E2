import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { User as IUser } from '../../src/types';

const SALT_ROUNDS = 10;

// Interface for the User document
interface IUserDocument extends Omit<IUser, 'id' | 'interests'>, Document {
    password?: string;
    interests?: string[];
    bookmarks?: Schema.Types.ObjectId[];
    comparePassword(candidatePassword: string): Promise<boolean>;
    id: string;
}

// Interface for the User model (for static methods)
interface IUserModel extends Model<IUserDocument> {}

const userSchema = new Schema<IUserDocument, IUserModel>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    handle: { type: String, required: true, unique: true },
    avatarUrl: String,
    role: { type: String, enum: ['Career Scientist', 'Civilian Scientist'] },
    bio: String,
    interests: [String],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.password;
            delete ret.__v;
            delete ret.bookmarks; // Don't include bookmark IDs by default
        }
    },
    toObject: { virtuals: true }
});

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<IUserDocument, IUserModel>('User', userSchema);