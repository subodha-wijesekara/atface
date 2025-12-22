import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, descriptors, phoneNumber, address, nic, profileImage, roomId } = body;

        if (!name || !descriptors || descriptors.length === 0) {
            return NextResponse.json({ error: 'Name and descriptors are required' }, { status: 400 });
        }

        // 1. Fetch all existing students with descriptors (Optionally filter by room later)
        const existingStudents = await Student.find({}, 'name descriptors');

        // 2. Check for Similarity (Euclidean Distance < 0.6)
        // We only check the first descriptor of the new student against all descriptors in DB
        const newDescriptor = descriptors[0];

        for (const student of existingStudents) {
            for (const existingDesc of student.descriptors) {
                // Simple Euclidean Distance Calculation
                const distance = euclideanDistance(newDescriptor, existingDesc);
                if (distance < 0.5) { // 0.5 is a strict threshold for "Same Person"
                    return NextResponse.json({
                        error: `Face already registered as ${student.name}`,
                        existingStudent: student.name
                    }, { status: 409 });
                }
            }
        }

        const newStudent = await Student.create({
            name,
            phoneNumber,
            address,
            nic,
            profileImage,
            descriptors,
            roomIds: roomId ? [roomId] : [] // Save roomId to array
        });

        return NextResponse.json({ success: true, student: newStudent });
    } catch (error: any) {
        console.error('Error registering student:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// Helper: Calculate Euclidean Distance between two vectors
function euclideanDistance(desc1: number[], desc2: number[]): number {
    return Math.sqrt(
        desc1.map((val, i) => val - desc2[i])
            .reduce((sum, diff) => sum + diff * diff, 0)
    );
}

export async function GET() {
    try {
        await dbConnect();
        const students = await Student.find({});
        return NextResponse.json(students);
    } catch (error: any) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
