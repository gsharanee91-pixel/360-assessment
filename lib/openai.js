import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePeerQuestion(competencies, studentRatings) {
  // Build a text summary of the student's self-ratings
  let ratingSummary = competencies.map(comp => {
    const questions = comp.questions.map(q => {
      const rating = studentRatings[q.id] || 'Not rated';
      return `- ${q.text} (Self-Rating: ${rating}/5)`;
    }).join('\n');
    return `**${comp.name}**:\n${questions}`;
  }).join('\n\n');

  const prompt = `
    Act as a senior organizational psychologist and executive coach. 
    Below is a candidate's self-assessment data across several core competencies.
    
    ${ratingSummary}

    Please formulate a single, highly professional, and thought-provoking evaluation question for a peer reviewer. 
    The question should encourage the reviewer to provide a holistic assessment of the candidate's performance, 
    focusing on the alignment between their self-perception and their observed professional behavior, 
    as well as identifying key strengths and developmental areas.
    
    Return ONLY the question text. Do not include introductory phrases like "Here is the question".
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Error:", error);
    return "Based on the candidate's self-assessment across all core competencies, how would you evaluate their overall professional performance, highlighting key strengths and areas for developmental growth?";
  }
}