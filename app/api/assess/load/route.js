import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { generatePeerQuestion } from '../../../../lib/openai';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const participant = await prisma.participant.findUnique({
    where: { token },
    include: {
      assessment: {
        include: {
          competencies: {
            include: { questions: true },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!participant) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });

  let studentResponses = null;
  let aiQuestion = null;

  if (participant.role === 'peer' && participant.targetEmail) {
    // FIX: Changed createdAt to invitedAt
    const student = await prisma.participant.findFirst({
      where: { 
        assessmentId: participant.assessmentId, 
        email: participant.targetEmail, 
        role: 'self' 
      },
      orderBy: { 
        invitedAt: 'desc' 
      }
    });

    if (student) {
      const studentSurvey = await prisma.survey.findFirst({ 
        where: { participantId: student.id } 
      });
      
      if (studentSurvey) {
        const responses = await prisma.response.findMany({ 
          where: { surveyId: studentSurvey.id } 
        });
        studentResponses = responses.reduce((acc, r) => { 
          acc[r.questionId] = r.value; 
          return acc; 
        }, {});
      }
      
      // Generate AI Question
      aiQuestion = await generatePeerQuestion(participant.assessment.competencies, studentResponses || {});
    }
  }

  return NextResponse.json({ ...participant, studentResponses, aiQuestion });
}