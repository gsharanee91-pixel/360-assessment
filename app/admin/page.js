"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/assessments')
      .then(res => res.json())
      .then(data => {
        setAssessments(data);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc }),
    });
    const data = await res.json();
    if (data.id) window.location.href = `/admin/assessments/${data.id}`;
  };

  if (loading) return <div className="p-10 text-center text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black">360° Admin Portal</h1>

        <div className="bg-gray-50 p-6 rounded shadow mb-8 border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-black">Create New Assessment</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" placeholder="Title (e.g. Leadership 2026)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border border-gray-400 rounded text-black" required />
            <textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-3 border border-gray-400 rounded text-black" required />
            <button type="submit" className="bg-black text-white px-6 py-3 rounded font-bold hover:bg-gray-800 w-full">Create & Start Editing</button>
          </form>
        </div>

        <h2 className="text-xl font-bold mb-4 text-black">Existing Assessments</h2>
        <div className="space-y-4">
          {assessments.map(a => (
            <Link key={a.id} href={`/admin/assessments/${a.id}`} className="block bg-gray-50 p-5 rounded shadow hover:bg-gray-100 border border-gray-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-black">{a.title}</h3>
                  <p className="text-gray-800 text-sm">{a.description}</p>
                </div>
                <div className="text-sm bg-black text-white px-3 py-1 rounded-full font-bold">
                  {a.participants?.length || 0} Participants
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}