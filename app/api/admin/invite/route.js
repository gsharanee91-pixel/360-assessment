import { prisma } from '@/lib/prisma';
import { sendStudentInvite } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { assessmentId, assessmentTitle } = await request.json();

    // 1. Get all students (role: 'self') for this assessment
    const students = await prisma.participant.findMany({
      where: { assessmentId, role: 'self' }
    });

    if (students.length === 0) {
      return NextResponse.json({ error: 'No students found' }, { status: 400 });
    }

    // 2. Send an email to each student
    for (const student of students) {
      await sendStudentInvite({
        to: student.email,
        name: student.name,
        assessmentId: assessmentId,
        participantId: student.id, // This creates the unique direct link!
        assessmentTitle: assessmentTitle
      });
    }

    return NextResponse.json({ success: true, count: students.length });
  } catch (error) {
    console.error("Invite API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}