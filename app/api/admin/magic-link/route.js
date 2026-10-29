import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  // 1. Find your latest assessment (e.g., "Critical Thinking")
  const assessment = await prisma.assessment.findFirst({ 
    orderBy: { createdAt: 'desc' } 
  });
  
  if (!assessment) {
    return NextResponse.json({ error: 'Please create an assessment in the admin dashboard first.' });
  }

  // 2. Create a fake "Test Student" for this assessment
  const token = crypto.randomUUID();
  await prisma.participant.create({
    data: {
      assessmentId: assessment.id,
      name: 'Test Student',
      email: 'student@example.com',
      role: 'self',
      token: token,
      status: 'pending',
    }
  });

  // 3. Return the real link
  const link = `http://localhost:3000/assess/${token}`;
  return NextResponse.json({ link });
}