import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await context.params;
        const student = await Student.findById(id);

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, student });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await context.params;
        const body = await request.json();

        // Handle specific array operations if needed, but for now simple update
        // If enrolling in a new room, frontend should send the updated roomIds array 
        // OR we can handle $addToSet here. Let's assume frontend sends full update or partial for other fields.
        // For enrollment specifically, let's verify if we need special handling.
        // The frontend 'Enroll' modal will likely send { roomIds: [...] }

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, student: updatedStudent });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await context.params;

        // Optional: Delete attendance records for this student?
        // Let's keep attendance logs for history, but maybe anonymize? 
        // For now, just delete the student profile.
        const deletedStudent = await Student.findByIdAndDelete(id);

        if (!deletedStudent) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Student deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
