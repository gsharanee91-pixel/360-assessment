"use client"
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function ReportsContent() {
  const params = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/admin/reports?assessmentId=${params.id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("API failed");
          return await res.json();
        })
        .then(data => {
          setReportData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Could not load reports. Make sure evaluations have been submitted.");
          setLoading(false);
        });
    }
  }, [params?.id]);

  if (loading) return <div className="p-10 text-center text-black">Loading Reports...</div>;
  if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <Link href={`/admin/assessments/${params.id}`} className="text-black hover:text-gray-600 font-bold mb-6 inline-block">← Back to Assessment</Link>
        
        <h1 className="text-3xl font-bold text-black mb-2">360° Assessment Reports</h1>
        <p className="text-gray-800 mb-8">Anonymous aggregated results from Peers and Co-leads.</p>

        {reportData.length === 0 ? (
          <div className="bg-gray-50 p-10 rounded text-center border border-gray-300">
            <p className="text-black font-bold text-lg">No evaluations submitted yet.</p>
            <p className="text-gray-600 mt-2">Share the portal link with your peers to start collecting data!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {reportData.map((student, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded shadow border border-gray-300">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-black">{student.studentName}</h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Evaluations Received</p>
                    <p className="text-2xl font-bold text-black">{student.evaluatorCount}</p>
                  </div>
                </div>

                <h3 className="font-bold text-black mb-4">Competency Averages (1-5)</h3>
                <div className="space-y-4 mb-8">
                  {student.competencyAverages.map((comp, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-black font-medium">{comp.name}</span>
                        <span className="text-black font-bold">{comp.average} / 5.0</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-4">
                        <div 
                          className="bg-black h-4 rounded-full transition-all duration-500" 
                          style={{ width: `${(comp.average / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {student.anonymousFeedback.length > 0 && (
                  <div>
                    <h3 className="font-bold text-black mb-4">Anonymous Overall Feedback</h3>
                    <div className="space-y-3">
                      {student.anonymousFeedback.map((fb, i) => (
                        <div key={i} className="bg-white p-4 rounded border-l-4 border-black text-gray-800 italic">
                          "{fb}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-black">Loading...</div>}>
      <ReportsContent />
    </Suspense>
  );
}