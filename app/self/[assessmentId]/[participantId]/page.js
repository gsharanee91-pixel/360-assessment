"use client"
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';

function SelfContent() {
  const params = useParams();
  const [student, setStudent] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (params?.assessmentId && params?.participantId) {
      fetch(`/api/self/find?assessmentId=${params.assessmentId}&participantId=${params.participantId}`)
        .then(res => {
          if (!res.ok) throw new Error("Invalid link");
          return res.json();
        })
        .then(data => {
          setStudent(data);
          if (data.selfSurvey) {
            const existingRatings = {};
            data.selfSurvey.responses.forEach(r => { existingRatings[r.questionId] = r.value; });
            setRatings(existingRatings);
          }
        });

      fetch(`/api/portal/competencies?assessmentId=${params.assessmentId}`)
        .then(res => res.json())
        .then(data => {
          setCompetencies(data);
          setLoading(false);
        });
    }
  }, [params.assessmentId, params.participantId]);

  const handleRating = (questionId, value) => setRatings(prev => ({ ...prev, [questionId]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch('/api/self/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: params.participantId, assessmentId: params.assessmentId, ratings }),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("Error submitting.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-black">Loading Assessment...</div>;
  if (!student) return <div className="p-10 text-center text-red-600">Invalid Link.</div>;

  if (submitted) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><h1 className="text-3xl font-bold text-black">Thank you, {student.name}! Your self-assessment is complete.</h1></div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-2">Self-Assessment for {student.name}</h1>
        <p className="text-gray-800 mb-8">Rate yourself honestly (1 = Strongly Disagree, 5 = Strongly Agree).</p>

        <div className="space-y-8">
          {competencies.map(comp => (
            <div key={comp.id} className="bg-gray-50 p-6 rounded shadow border border-gray-300">
              <h2 className="text-xl font-bold text-black mb-4 border-b pb-2">{comp.name}</h2>
              <div className="space-y-6">
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
            </div>
          ))}
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-black text-white p-4 rounded font-bold hover:bg-gray-800 text-lg disabled:bg-gray-400">
            {submitting ? 'Submitting...' : 'Submit Self-Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelfPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-black">Loading...</div>}>
      <SelfContent />
    </Suspense>
  );
}