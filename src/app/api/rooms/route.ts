import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

export async function GET() {
    try {
        await dbConnect();
        const rooms = await Room.find({}).sort({ createdAt: -1 });
        return NextResponse.json(rooms);
    } catch (error: any) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
        }

        const newRoom = await Room.create({
            name,
            description
        });

        return NextResponse.json({ success: true, room: newRoom });
    } catch (error: any) {
        console.error('Error creating room:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
