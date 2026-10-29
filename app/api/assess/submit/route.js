import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { sendPeerInvite } from '../../../../lib/email';

export async function POST(request) {
  const { token, ratings, comment } = await request.json();

  const participant = await prisma.participant.findUnique({ 
    where: { token },
    include: { assessment: true }
  });
  
  if (!participant) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });

  let survey = await prisma.survey.findFirst({ where: { participantId: participant.id } });
  if (!survey) {
    survey = await prisma.survey.create({
      data: { participantId: participant.id, assessmentId: participant.assessmentId }
    });
  }

  // Save 1-5 ratings (if any)
  if (ratings && Object.keys(ratings).length > 0) {
    await prisma.response.deleteMany({ where: { surveyId: survey.id } });
    for (const [questionId, value] of Object.entries(ratings)) {
      if (value) {
        await prisma.response.create({
          data: { surveyId: survey.id, questionId, value: parseInt(value) }
        });
      }
    }
  }

  // Save the peer's text comment
  if (comment) {
    await prisma.survey.update({
      where: { id: survey.id },
      data: { peerComment: comment }
    });
  }

  await prisma.participant.update({
    where: { id: participant.id },
    data: { status: 'completed', completedAt: new Date() }
  });

  if (participant.role === 'self') {
    const peers = await prisma.participant.findMany({
      where: { assessmentId: participant.assessmentId, role: 'peer', targetEmail: participant.email }
    });
    for (const peer of peers) {
      await sendPeerInvite({ to: peer.email, name: peer.name, token: peer.token, assessmentTitle: participant.assessment.title, studentName: participant.name });
    }
  }

  return NextResponse.json({ success: true });
}