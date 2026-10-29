import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const data = await request.json();
  const question = await prisma.question.create({ data });
  return NextResponse.json(question);
}