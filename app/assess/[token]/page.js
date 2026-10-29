"use client"
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';

function AssessmentForm() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (params?.token) {
      fetch(`/api/assess/load?token=${params.token}`)
        .then(res => res.json())
        .then(data => { setData(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [params?.token]);

  const handleRating = (questionId, value) => setRatings({ ...ratings, [questionId]: value });

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch('/api/assess/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, ratings, comment }),
    });
    if (res.ok) setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) return <div className="p-8 text-center text-black">Loading...</div>;
  if (!data || data.error) return <div className="p-8 text-center text-red-600 font-bold">Invalid or expired link.</div>;
  
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded shadow text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Thank you!</h1>
          <p className="text-gray-600">Your evaluation has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  const isPeer = data.role === 'peer';

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isPeer ? `Peer Evaluation for ${data.targetName}` : '360 Feedback Self Assessment'}
          </h1>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {isPeer 
              ? `Please evaluate ${data.targetName}. Below is their self-assessment and an evaluation prompt to guide your feedback.` 
              : 'Please rate the following statements based on your own performance.'}
          </p>
        </div>

        {/* STUDENT SELF-RATINGS SUMMARY (Only for Peer) */}
        {isPeer && data.studentResponses && (
          <div className="mb-10 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-4 text-lg">Candidate's Self-Assessment Summary:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.assessment.competencies.map(comp => (
                <div key={comp.id} className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-2">{comp.name}</h4>
                  {comp.questions.map(q => (
                    <div key={q.id} className="flex justify-between text-sm text-gray-600 mb-1">
                      <span className="truncate pr-2">{q.text}</span>
                      <span className="font-bold text-blue-600">{data.studentResponses[q.id] || '-'}/5</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFESSIONAL EVALUATION PROMPT (Only for Peer) */}
        {isPeer && data.aiQuestion && (
          <div className="mb-10">
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Evaluation Prompt</h3>
              <p className="text-gray-900 text-xl leading-relaxed font-medium italic">
                "{data.aiQuestion}"
              </p>
            </div>
            
            <label className="block font-bold text-gray-800 mb-3 text-lg">Your Professional Feedback:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please provide a comprehensive evaluation addressing the prompt above. Include specific examples where possible..."
              className="w-full p-5 border border-gray-300 rounded-lg h-56 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 leading-relaxed"
            />
          </div>
        )}

        {/* STANDARD 1-5 QUESTIONS (Only for Student/Self) */}
        {!isPeer && (
          <div className="space-y-8">
            {data.assessment.competencies.map((comp) => (
              <div key={comp.id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-200 px-6 py-3">
                  <h2 className="text-xl font-bold text-gray-800">{comp.name}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {comp.questions && comp.questions.map((q) => (
                    <div key={q.id} className="flex flex-col md:flex-row p-6 hover:bg-gray-50 transition">
                      <div className="md:w-2/3 pr-4 mb-4 md:mb-0">
                        <p className="text-gray-800 font-medium leading-relaxed">{q.text}</p>
                      </div>
                      <div className="md:w-1/3 flex md:justify-end items-center gap-4">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button key={num} onClick={() => handleRating(q.id, num)}
                              className={`w-10 h-10 border rounded font-bold transition flex items-center justify-center ${ratings[q.id] === num ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="mt-10 mb-20">
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : `Submit ${isPeer ? 'Evaluation' : 'Assessment'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PublicAssessment() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-black">Loading...</div>}>
      <AssessmentForm />
    </Suspense>
  );
}