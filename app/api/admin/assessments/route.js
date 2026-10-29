import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const assessments = await prisma.assessment.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { participants: true } // To see how many people are uploaded
  });
  return NextResponse.json(assessments);
}

export async function POST(request) {
  const { title, description } = await request.json();
  const assessment = await prisma.assessment.create({
    data: { title, description }
  });
  return NextResponse.json(assessment);
}