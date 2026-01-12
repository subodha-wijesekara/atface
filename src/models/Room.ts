import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
    name: string;
    description?: string;
    teacherId?: mongoose.Types.ObjectId;
    status: 'active' | 'pending';
    createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
    name: { type: String, required: true },
    description: { type: String },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'pending'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
});

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
