import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const role = (session.user as any).role;
        const userId = (session.user as any).id;

        let query: any = {};

        if (role === 'admin') {
            // Admin can filter by status, or see all
            if (status) {
                query.status = status;
            }
            // If no status specified, currently returns all (which matches Maintenance view needs)
        } else {
            // Teacher: see ALL their assigned classes (Active + Pending)
            query = {
                teacherId: userId
            };
        }

        const rooms = await Room.find(query).populate('teacherId', 'username').sort({ createdAt: -1 });

        return NextResponse.json(rooms);
    } catch (error: any) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;
        const body = await request.json();
        const { name, description, teacherId } = body;

        if (!name) {
            return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
        }

        // Determine status and teacherId based on role
        let roomStatus = 'active';
        let assignedTeacherId = teacherId || null;

        if (role !== 'admin') {
            // Non-admins (Teachers) create Pending requests assigned to themselves
            roomStatus = 'pending';
            assignedTeacherId = (session.user as any).id;
        }

        const newRoom = await Room.create({
            name,
            description,
            teacherId: assignedTeacherId,
            status: roomStatus
        });

        return NextResponse.json({ success: true, room: newRoom });
    } catch (error: any) {
        console.error('Error creating room:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
