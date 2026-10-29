"use client"
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.assessmentId) {
      fetch(`/api/admin/reports?assessmentId=${params.assessmentId}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    }
  }, [params?.assessmentId]);

  if (loading) return <div className="p-10 text-center text-gray-500">Generating Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="mb-6 text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2">
          ← Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">360° Assessment Reports</h1>

        {data.length === 0 ? (
          <div className="bg-white p-10 rounded shadow text-center text-gray-500">No student submissions found yet.</div>
        ) : (
          data.map((student, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-100">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{student.studentName}</h2>
                <p className="text-gray-500 text-sm">{student.studentEmail}</p>
              </div>

              {/* Visual Comparison Bars */}
              <div className="space-y-6 mb-8">
                {student.competencies.map((comp, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-gray-700">{comp.name}</span>
                      <div className="flex gap-4 text-sm font-medium">
                        <span className="text-blue-600">Self: {comp.selfScore}/5</span>
                        <span className="text-emerald-600">Peer: {comp.peerScore}/5</span>
                      </div>
                    </div>
                    
                    {/* Self Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                      <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(comp.selfScore / 5) * 100}%` }}></div>
                    </div>
                    
                    {/* Peer Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(comp.peerScore / 5) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Peer Written Feedback */}
              {student.peerComments.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📝 Peer Feedback
                  </h3>
                  {student.peerComments.map((c, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">From: {c.peerName}</p>
                      <p className="text-gray-700 italic leading-relaxed">"{c.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}