import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');

  if (!assessmentId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const competencies = await prisma.competency.findMany({
    where: { assessmentId },
    include: { questions: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' }
  });

  return NextResponse.json(competencies);
}