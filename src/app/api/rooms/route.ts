import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

import { getServerSession } from "next-auth";
import { handler as authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = {};
        // Previously filtered by role, now fetching all for everyone

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

        const body = await request.json();
        const { name, description, teacherId } = body;

        if (!name) {
            return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
        }

        const newRoom = await Room.create({
            name,
            description,
            teacherId: teacherId || null // Optional assignment
        });

        return NextResponse.json({ success: true, room: newRoom });
    } catch (error: any) {
        console.error('Error creating room:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
