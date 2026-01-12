import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Only Admin can fetch teachers list
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const teachers = await User.find({ role: 'teacher' }).select('username fullName _id');
        return NextResponse.json(teachers);
    } catch (error: any) {
        console.error('Error fetching teachers:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
