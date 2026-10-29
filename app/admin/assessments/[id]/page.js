"use client"
import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
   
function AssessmentContent() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Competency Builder State
  const [competencies, setCompetencies] = useState([]);
  const [newCompName, setNewCompName] = useState('');
  const [newQ1, setNewQ1] = useState('');
  const [newQ2, setNewQ2] = useState('');
  const [compStatus, setCompStatus] = useState('');

  const fetchAssessment = () => {
    if (params?.id) {
      fetch(`/api/admin/assessments/${params.id}`)
        .then(res => res.json())
        .then(data => { setAssessment(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  };

  const fetchCompetencies = () => {
    if (params?.id) {
      fetch(`/api/admin/competencies?assessmentId=${params.id}`)
        .then(res => res.json())
        .then(data => setCompetencies(data));
    }
  };

  useEffect(() => {
    fetchAssessment();
    fetchCompetencies();
  }, [params?.id]);

  const handleFileChange = (e) => setCsvFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!csvFile) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(r => r.split(','));
      const headers = rows[0];
      const participants = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = row[i]?.trim());
        return obj;
      }).filter(p => p.email);

      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: params.id, participants }),
      });
      const data = await res.json();
      
      if (data.count) {
        setUploadStatus(`✅ Successfully uploaded ${data.count} participants!`);
        fetchAssessment(); 
      } else {
        setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
      }
    };
    reader.readAsText(csvFile);
  };

  const handleAddCompetency = async () => {
    if (!newCompName || !newQ1 || !newQ2) {
      setCompStatus('⚠️ Please fill in all fields.');
      return;
    }

    const res = await fetch('/api/admin/competencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId: params.id,
        name: newCompName,
        questions: [{ text: newQ1 }, { text: newQ2 }]
      }),
    });

    if (res.ok) {
      setCompStatus(`✅ Added "${newCompName}" successfully!`);
      setNewCompName('');
      setNewQ1('');
      setNewQ2('');
      fetchCompetencies(); 
    } else {
      setCompStatus('❌ Failed to add competency.');
    }
  };

  // --- NEW: Send Invites Function ---
  const handleSendInvites = async () => {
    const studentCount = assessment.participants ? assessment.participants.filter(p => p.role === 'self').length : 0;
    if (studentCount === 0) return alert("No students found to invite. Please upload a CSV first.");
    if (!confirm(`Send self-assessment invites to ${studentCount} students?`)) return;
    
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId: params.id, assessmentTitle: assessment.title }),
    });
    
    if (res.ok) {
      alert("✅ Invites sent successfully! Check the terminal for logs.");
    } else {
      alert("❌ Failed to send invites. Check terminal for errors.");
    }
  };

  if (loading) return <div className="p-10 text-center text-black">Loading...</div>;
  if (!assessment) return <div className="p-10 text-center text-red-600 font-bold">Assessment not found.</div>;

  return (
    <div className="min-h-screen bg-white p-8"> 
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="mb-6 text-black hover:text-gray-600 font-bold">← Back to Dashboard</button>
        
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-black">{assessment.title}</h1>
            <p className="text-gray-800 mt-2">{assessment.description}</p>
          </div>
          {/* NEW: View Reports Button */}
          <Link href={`/admin/assessments/${params.id}/reports`} className="bg-black text-white px-6 py-3 rounded font-bold hover:bg-gray-800 inline-block">
            📊 View Visual Reports
          </Link>
        </div>

        {/* COMPETENCY BUILDER SECTION */}
        <div className="bg-gray-50 rounded-lg shadow p-6 mt-8 border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-black">1. Build Competencies & Questions</h2>
          <p className="text-black mb-4 text-sm">Add the competencies that peers will evaluate. Each competency needs 2 behavioral statements.</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Competency Name (e.g. Integrity, Empathy)" 
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="w-full p-3 border border-gray-400 rounded text-black" 
            />
            <input 
              type="text" 
              placeholder="Statement 1 (e.g. Tells the truth even when it's difficult)" 
              value={newQ1}
              onChange={(e) => setNewQ1(e.target.value)}
              className="w-full p-3 border border-gray-400 rounded text-black" 
            />
            <input 
              type="text" 
              placeholder="Statement 2 (e.g. Admits mistakes and takes responsibility)" 
              value={newQ2}
              onChange={(e) => setNewQ2(e.target.value)}
              className="w-full p-3 border border-gray-400 rounded text-black" 
            />
            <button 
              onClick={handleAddCompetency}
              className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800"
            >
              Add Competency
            </button>
          </div>

          {compStatus && <p className="mt-4 font-bold">{compStatus}</p>}

          {competencies.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-black mb-2">Added Competencies ({competencies.length}):</h3>
              <div className="space-y-3">
                {competencies.map(comp => (
                  <div key={comp.id} className="bg-white p-4 rounded border border-gray-300">
                    <h4 className="font-bold text-black text-lg">{comp.name}</h4>
                    <ul className="list-disc ml-6 mt-2 text-gray-800">
                      {comp.questions.map(q => (
                        <li key={q.id}>{q.text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CSV UPLOAD SECTION */}
        <div className="bg-gray-50 rounded-lg shadow p-6 mt-8 border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-black">2. Invite Participants (Students, Peers, Co-leads)</h2>
          <p className="text-black mb-4 text-sm">
            CSV headers must be: <code className="bg-gray-200 p-1 rounded text-black">name, email, role</code><br/>
            <span className="font-bold">Roles:</span> self, peer, colead
          </p>
          
          {/* NEW: Send Invites Button */}
          <button 
            onClick={handleSendInvites}
            className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700 mb-4 flex items-center gap-2"
          >
            📧 Send Student Email Invites
          </button>

          <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4 block w-full text-sm text-black" />
          <button onClick={handleUpload} className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800">Upload CSV</button>
          
          {uploadStatus && <p className="mt-4 font-bold">{uploadStatus}</p>}

          {assessment.participants && assessment.participants.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-black mb-2">Uploaded Participants ({assessment.participants.length}):</h3>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
                {assessment.participants.map(p => (
                  <div key={p.id} className="flex justify-between text-sm py-1 border-b last:border-0 text-black">
                    <span>{p.name} ({p.email})</span>
                    <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${p.role === 'self' ? 'bg-blue-200 text-blue-900' : p.role === 'peer' ? 'bg-green-200 text-green-900' : 'bg-purple-200 text-purple-900'}`}>
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-black">Loading...</div>}>
      <AssessmentContent />
    </Suspense>
  );
}