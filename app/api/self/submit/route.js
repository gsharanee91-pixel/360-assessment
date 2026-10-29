import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { participantId, assessmentId, ratings } = await request.json();

    // 1. Find or create a Survey record for this student
    let survey = await prisma.survey.findFirst({ 
      where: { participantId } 
    });
    
    if (!survey) {
      survey = await prisma.survey.create({
        data: { 
          participantId, 
          assessmentId 
        }
      });
    }

    // 2. Delete old ratings if they are updating their submission
    await prisma.response.deleteMany({ 
      where: { surveyId: survey.id } 
    });

    // 3. Save the new 1-5 ratings
    for (const [questionId, value] of Object.entries(ratings)) {
      if (value) {
        await prisma.response.create({
          data: { 
            surveyId: survey.id, 
            questionId, 
            value: parseInt(value) 
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Self Submit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}