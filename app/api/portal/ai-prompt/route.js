import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { studentName, hasSelfAssessment, competencyNames } = await request.json();

    // Check if OpenAI key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        prompt: `Please evaluate ${studentName} based on the following competencies: ${competencyNames.join(', ')}. Your feedback will be completely anonymous.` 
      });
    }

    // Dynamic import to avoid build errors
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey });

    let promptText = "";
    if (hasSelfAssessment) {
      promptText = `Generate a short, professional evaluation prompt (2-3 sentences) for a peer evaluating ${studentName}. ${studentName} has ALREADY completed their self-assessment. Ask the evaluator to compare their observations with the student's self-view. Competencies to focus on: ${competencyNames.join(', ')}. Keep it concise and professional.`;
    } else {
      promptText = `Generate a short, professional evaluation prompt (2-3 sentences) for a peer evaluating ${studentName}. ${studentName} has NOT completed their self-assessment yet. Ask the evaluator to provide an objective observation based purely on their own interactions. Competencies to focus on: ${competencyNames.join(', ')}. Keep it concise and professional.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptText }],
      max_tokens: 150,
    });

    const aiText = response.choices[0]?.message?.content || `Please evaluate ${studentName} based on: ${competencyNames.join(', ')}.`;

    return NextResponse.json({ prompt: aiText });
  } catch (error) {
    console.error("AI API Error:", error);
    // Always return a fallback prompt so the frontend doesn't crash
    return NextResponse.json({ 
      prompt: "Please provide your honest, anonymous evaluation based on your professional observations." 
    });
  }
}