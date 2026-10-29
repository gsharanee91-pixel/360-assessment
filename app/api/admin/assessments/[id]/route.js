import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params; 

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { 
      competencies: { 
        include: { questions: true }, 
        orderBy: { order: 'asc' } 
      },
      participants: true
    }
  });

  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  return NextResponse.json(assessment);
}