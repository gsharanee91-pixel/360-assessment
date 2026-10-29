import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');

  if (!assessmentId) return NextResponse.json({ error: 'Missing assessmentId' }, { status: 400 });

  // Fetch ALL participants for this assessment
  const participants = await prisma.participant.findMany({
    where: { assessmentId },
    include: { selfSurvey: true },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(participants);
}