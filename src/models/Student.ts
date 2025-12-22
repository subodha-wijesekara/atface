import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IStudent extends Document {
    name: string;
    phoneNumber?: string;
    address?: string;
    nic?: string;
    profileImage?: string; // Base64 encoded image
    descriptors: number[][]; // Array of float arrays
    roomIds: string[]; // Reference to Room IDs
    registeredAt: Date;
}

const StudentSchema = new Schema<IStudent>({
    name: { type: String, required: true },
    phoneNumber: { type: String },
    address: { type: String },
    nic: { type: String },
    profileImage: { type: String },
    descriptors: { type: [[Number]], required: true },
    roomIds: { type: [String], default: [] },
    registeredAt: { type: Date, default: Date.now },
});

// Delete existing model to re-compile schema if needed (or to handle hmr)
if (mongoose.models.Student) {
    delete mongoose.models.Student;
}

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
