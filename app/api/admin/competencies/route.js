import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all competencies for an assessment
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');

  if (!assessmentId) return NextResponse.json({ error: 'Missing assessmentId' }, { status: 400 });

  const competencies = await prisma.competency.findMany({
    where: { assessmentId },
    include: { questions: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' }
  });

  return NextResponse.json(competencies);
}

// POST create a new competency with questions
export async function POST(request) {
  const { assessmentId, name, questions } = await request.json();

  const competency = await prisma.competency.create({
    data: {
      name,
      assessmentId,
      questions: {
        create: questions.map((q, index) => ({
          text: q.text,
          order: index
        }))
      }
    },
    include: { questions: true }
  });

  return NextResponse.json(competency);
}