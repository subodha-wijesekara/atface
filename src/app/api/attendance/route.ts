import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { studentId, name, timestamp, roomId } = body;

        if (!studentId || !name) {
            return NextResponse.json({ error: 'Student ID and name are required' }, { status: 400 });
        }

        // Check for existing records today for this student in this room
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingRecord = await Attendance.findOne({
            studentId,
            roomId,
            timestamp: { $gte: startOfDay }
        });

        if (existingRecord) {
            return NextResponse.json({ error: 'Student already marked present in this class today' }, { status: 409 });
        }

        const newRecord = await Attendance.create({
            studentId,
            name,
            roomId,
            timestamp: timestamp || new Date(),
            status: 'present'
        });

        return NextResponse.json({ success: true, record: newRecord });
    } catch (error: any) {
        console.error('Error marking attendance:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const roomId = searchParams.get('roomId');

        let query: any = {};
        if (roomId) {
            query.roomId = roomId;
        }

        if (from || to) {
            query.timestamp = {};
            if (from) {
                query.timestamp.$gte = new Date(from);
            }
            if (to) {
                // Set 'to' date to end of the day if needed, but assuming simple comparison for now
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                query.timestamp.$lte = toDate;
            }
        }

        const attendance = await Attendance.find(query).sort({ timestamp: -1 });
        return NextResponse.json(attendance);
    } catch (error: any) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
