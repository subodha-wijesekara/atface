import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await context.params;
        const room = await Room.findById(id);

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json({ room });
    } catch (error: any) {
        console.error('Error fetching room:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
