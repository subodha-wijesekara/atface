import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await context.params;

        const deletedRecord = await Attendance.findByIdAndDelete(id);

        if (!deletedRecord) {
            return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Record deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting attendance:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
