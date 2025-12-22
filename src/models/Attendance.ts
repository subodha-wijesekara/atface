import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IAttendance extends Document {
    studentId: string;
    name: string;
    roomId?: string;
    timestamp: Date;
    status?: string;
}

const AttendanceSchema = new Schema<IAttendance>({
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    roomId: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'present' },
});

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
