import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { evaluatorName, evaluatorEmail, targetId, assessmentId, ratings, overallRating, overallFeedback } = await request.json();

  // 1. Find or create the evaluator record
  let evaluator = await prisma.participant.findFirst({
    where: { email: evaluatorEmail, assessmentId }
  });

  if (!evaluator) {
    evaluator = await prisma.participant.create({
      data: { name: evaluatorName, email: evaluatorEmail, role: 'evaluator', assessmentId }
    });
  }

  // 2. Create the Evaluation record
  const evaluation = await prisma.evaluation.create({
    data: { assessmentId, evaluatorId: evaluator.id, targetId }
  });

  // 3. Save the 1-5 Ratings
  for (const [questionId, value] of Object.entries(ratings)) {
    if (value) {
      await prisma.response.create({
        data: { evaluationId: evaluation.id, questionId, value: parseInt(value) }
      });
    }
  }

  // 4. Save the Overall Feedback
  if (overallRating && overallFeedback) {
    await prisma.overallFeedback.create({
      data: { evaluationId: evaluation.id, rating: parseInt(overallRating), feedback: overallFeedback }
    });
  }

  return NextResponse.json({ success: true });
}