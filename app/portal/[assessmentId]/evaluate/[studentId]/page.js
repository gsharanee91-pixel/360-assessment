"use client"
import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function EvaluateContent() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [ratings, setRatings] = useState({}); 
  const [feedback, setFeedback] = useState({}); 
  const [overallRating, setOverallRating] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Generating AI guidance...');

  useEffect(() => {
    const evalName = sessionStorage.getItem('evaluatorName');
    if (!evalName) {
      router.push(`/portal/${params.assessmentId}`);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Competencies
        const compRes = await fetch(`/api/portal/competencies?assessmentId=${params.assessmentId}`);
        const compData = await compRes.json();
        setCompetencies(compData);

        // 2. Fetch Student
        const studRes = await fetch(`/api/portal/students?assessmentId=${params.assessmentId}`);
        const allParticipants = await studRes.json();
        const targetStudent = allParticipants.find(p => p.id === params.studentId);
        setStudent(targetStudent);
        setLoading(false);
        
        // 3. Call AI API (with safety checks)
        if (targetStudent) {
          try {
            const aiRes = await fetch('/api/portal/ai-prompt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentName: targetStudent.name,
                hasSelfAssessment: !!targetStudent.selfSurvey,
                competencyNames: compData.map(c => c.name) 
              })
            });
            
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              setAiPrompt(aiData.prompt);
            } else {
              setAiPrompt(`Please evaluate ${targetStudent.name} based on your professional observations. Competencies: ${compData.map(c => c.name).join(', ')}.`);
            }
          } catch (aiError) {
            console.error("AI prompt failed:", aiError);
            setAiPrompt(`Please evaluate ${targetStudent.name} based on your professional observations.`);
          }
        }
      } catch (error) {
        console.error("Error loading form:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.assessmentId, params.studentId, router]);

  const handleRating = (questionId, value) => setRatings(prev => ({ ...prev, [questionId]: value }));
  const handleFeedback = (compId, text) => setFeedback(prev => ({ ...prev, [compId]: text }));

  const handleSubmit = async () => {
    if (overallRating === 0) { alert("Please provide an overall rating."); return; }
    setSubmitting(true);

    try {
      const res = await fetch('/api/portal/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluatorName: sessionStorage.getItem('evaluatorName'),
          evaluatorEmail: sessionStorage.getItem('evaluatorEmail'),
          targetId: params.studentId,
          assessmentId: params.assessmentId,
          ratings,
          overallRating,
          overallFeedback
        }),
      });

      if (res.ok) {
        alert("✅ Evaluation submitted anonymously!");
        router.push(`/portal/${params.assessmentId}`);
      } else {
        alert("❌ Error submitting evaluation.");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Error submitting evaluation.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-black">Loading Form...</div>;
  if (!student) return <div className="p-10 text-center text-red-600">Student not found.</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/portal/${params.assessmentId}`} className="text-black hover:text-gray-600 font-bold mb-6 inline-block">← Back to List</Link>
        
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-black">Evaluating: {student.name}</h1>
          <div className="mt-4 bg-gray-100 p-4 rounded border-l-4 border-black">
            <p className="font-bold text-black mb-1">AI Guidance:</p>
            <p className="text-gray-800 italic">{aiPrompt}</p>
          </div>
        </div>

        <div className="space-y-8">
          {competencies.map(comp => (
            <div key={comp.id} className="bg-gray-50 p-6 rounded shadow border border-gray-300">
              <h2 className="text-xl font-bold text-black mb-4 border-b pb-2">{comp.name}</h2>
              <div className="space-y-6 mb-6">
                {comp.questions.map(q => (
                  <div key={q.id}>
                    <p className="text-black font-medium mb-3">{q.text}</p>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button key={num} onClick={() => handleRating(q.id, num)}
                          className={`w-10 h-10 rounded-full font-bold border-2 transition ${ratings[q.id] === num ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-400 hover:border-black'}`}>
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">Specific Feedback for {comp.name} (Optional):</label>
                <textarea value={feedback[comp.id] || ''} onChange={(e) => handleFeedback(comp.id, e.target.value)}
                  className="w-full p-3 border border-gray-400 rounded text-black h-24" placeholder="Share your observations..." />
              </div>
            </div>
          ))}

          <div className="bg-black text-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Overall Evaluation</h2>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Overall Rating:</label>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <button key={num} onClick={() => setOverallRating(num)}
                    className={`w-12 h-12 rounded-full font-bold border-2 transition ${overallRating === num ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white hover:bg-gray-800'}`}>
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Overall Anonymous Feedback:</label>
              <textarea value={overallFeedback} onChange={(e) => setOverallFeedback(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded text-black h-32 bg-gray-100" placeholder="Final thoughts..." />
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-white text-black p-4 rounded font-bold hover:bg-gray-200 text-lg disabled:bg-gray-400">
              {submitting ? 'Submitting...' : 'Submit Anonymous Evaluation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-black">Loading...</div>}>
      <EvaluateContent />
    </Suspense>
  );
}