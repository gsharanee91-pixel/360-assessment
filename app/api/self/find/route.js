import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');
  const participantId = searchParams.get('participantId');

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { 
      selfSurvey: { include: { responses: true } } 
    }
  });

  if (participant && participant.assessmentId === assessmentId) {
    return NextResponse.json(participant);
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}