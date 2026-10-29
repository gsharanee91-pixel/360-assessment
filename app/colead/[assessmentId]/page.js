"use client"
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function CoLeadContent() {
  const params = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorEmail, setEvaluatorEmail] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (params?.assessmentId && isSignedIn) {
      fetch(`/api/portal/students?assessmentId=${params.assessmentId}`)
        .then(res => res.json())
        .then(data => {
          const studentsList = data.filter(p => p.role === 'self');
          setStudents(studentsList);
          setLoading(false);
        });
    }
  }, [params?.assessmentId, isSignedIn]);

  const handleEnterPortal = () => {
    if (!evaluatorName || !evaluatorEmail) {
      alert("Please enter both your name and email to continue.");
      return;
    }
    sessionStorage.setItem('evaluatorName', evaluatorName);
    sessionStorage.setItem('evaluatorEmail', evaluatorEmail);
    sessionStorage.setItem('evaluatorRole', 'colead'); // <--- Tags them as Co-Lead
    setIsSignedIn(true);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-gray-50 p-8 rounded shadow border border-gray-300">
          <h1 className="text-2xl font-bold text-black mb-6">Co-Lead Portal</h1>
          <p className="text-black mb-4">Please enter your details to begin evaluating anonymously.</p>
          <input 
            type="text" placeholder="Your Name" value={evaluatorName} onChange={(e) => setEvaluatorName(e.target.value)}
            className="w-full p-3 border border-gray-400 rounded mb-4 text-black" 
          />
          <input 
            type="email" placeholder="Your Email" value={evaluatorEmail} onChange={(e) => setEvaluatorEmail(e.target.value)}
            className="w-full p-3 border border-gray-400 rounded mb-6 text-black" 
          />
          <button onClick={handleEnterPortal} className="w-full bg-black text-white p-3 rounded font-bold hover:bg-gray-800">
            Enter Portal
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center text-black">Loading students...</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Student Evaluations</h1>
            <p className="text-gray-800 mt-1">Signed in as: <span className="font-bold">{evaluatorName}</span> (Co-Lead - Anonymous)</p>
          </div>
          <button onClick={() => setIsSignedIn(false)} className="text-sm text-gray-600 hover:text-black">Sign Out</button>
        </div>

        <div className="bg-gray-50 rounded shadow border border-gray-300 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200 border-b border-gray-300">
              <tr>
                <th className="p-4 text-black font-bold">Student Name</th>
                <th className="p-4 text-black font-bold">Status</th>
                <th className="p-4 text-black font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                 <tr><td colSpan="3" className="p-4 text-center text-gray-600">No students found.</td></tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-100">
                    <td className="p-4 text-black font-medium">{student.name}</td>
                    <td className="p-4">
                      {student.selfSurvey ? (
                        <span className="bg-green-200 text-green-900 text-xs font-bold px-2 py-1 rounded">Self-Assessment Done</span>
                      ) : (
                        <span className="bg-gray-200 text-gray-800 text-xs font-bold px-2 py-1 rounded">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/colead/${params.assessmentId}/evaluate/${student.id}`} className="bg-black text-white px-4 py-2 rounded font-bold hover:bg-gray-800 text-sm inline-block">
                        Evaluate
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CoLeadPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-black">Loading...</div>}>
      <CoLeadContent />
    </Suspense>
  );
}