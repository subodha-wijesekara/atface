import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
    name: string;
    description?: string;
    createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
