import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');
  const email = searchParams.get('email');

  if (!assessmentId || !email) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Find the student with this email for this specific assessment
  const participant = await prisma.participant.findFirst({
    where: { 
      assessmentId, 
      email: email.toLowerCase().trim(), 
      role: 'self' 
    },
    include: { 
      selfSurvey: { 
        include: { responses: true } 
      } 
    }
  });

  if (participant) {
    return NextResponse.json(participant);
  }
  
  return NextResponse.json({ error: 'Student not found' }, { status: 404 });
}