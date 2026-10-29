import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // 1. Get all students (targets) for this assessment
    const students = await prisma.participant.findMany({
      where: { assessmentId, role: 'self' },
      orderBy: { name: 'asc' }
    });

    // 2. Get all competencies
    const competencies = await prisma.competency.findMany({
      where: { assessmentId },
      include: { questions: true }
    });

    const reportData = [];

    for (const student of students) {
      // Find all evaluations where this student was the target
      const evaluations = await prisma.evaluation.findMany({
        where: { targetId: student.id },
        include: { 
          responses: { include: { question: true } },
          overall: true 
        }
      });

      if (evaluations.length === 0) continue; 

      let totalOverallRating = 0;
      let overallFeedbackList = [];
      let compAverages = {};

      competencies.forEach(c => { compAverages[c.id] = { name: c.name, total: 0, count: 0 }; });

      evaluations.forEach(evalRecord => {
        if (evalRecord.overall) {
          totalOverallRating += evalRecord.overall.rating;
          if (evalRecord.overall.feedback) overallFeedbackList.push(evalRecord.overall.feedback);
        }

        evalRecord.responses.forEach(resp => {
          if (resp.question) {
            const compId = resp.question.competencyId;
            if (compAverages[compId]) {
              compAverages[compId].total += resp.value;
              compAverages[compId].count += 1;
            }
          }
        });
      });

      const finalCompAverages = Object.values(compAverages).map(c => ({
        name: c.name,
        average: c.count > 0 ? (c.total / c.count).toFixed(1) : 0
      }));

      reportData.push({
        studentName: student.name,
        evaluatorCount: evaluations.length,
        overallAverage: (totalOverallRating / evaluations.length).toFixed(1),
        competencyAverages: finalCompAverages,
        anonymousFeedback: overallFeedbackList
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}