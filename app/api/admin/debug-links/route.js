import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get ALL participants from the database, newest first
    const participants = await prisma.participant.findMany({
      orderBy: { invitedAt: 'desc' }, // Changed to invitedAt
      include: { assessment: true } 
    });

    // Format the list safely
    const links = participants.map(p => ({
      assessment: p.assessment?.title || 'Unknown Assessment', 
      name: p.name,
      email: p.email,
      role: p.role,
      directLink: `http://localhost:3000/assess/${p.token}`
    }));

    return NextResponse.json(links);
  } catch (error) {
    console.error("Debug links error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}