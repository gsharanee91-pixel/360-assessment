import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { assessmentId, participants } = await request.json();
    let count = 0;

    for (const p of participants) {
      const role = p.role?.toLowerCase() || 'self'; 
      
      await prisma.participant.create({
        data: {
          name: p.name || 'Anonymous',
          email: p.email,
          role: role,
          // We only use 'assessment' connect here. Prisma automatically sets the assessmentId!
          assessment: { connect: { id: assessmentId } } 
        }
      });
      count++;
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}