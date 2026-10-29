"use client"
import { useState } from "react"

export default function CompetencyManager({ assessmentId, initialCompetencies }) {
  const [competencies, setCompetencies] = useState(initialCompetencies || [])
  const [newCompName, setNewCompName] = useState("")
  const [activeCompId, setActiveCompId] = useState(null)
  const [qText, setQText] = useState("")

  const addCompetency = async () => {
    if (!newCompName) return
    const res = await fetch("/api/admin/competencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId, name: newCompName, description: "", order: competencies.length }),
    })
    const newComp = await res.json()
    setCompetencies([...competencies, { ...newComp, questions: [] }])
    setNewCompName("")
  }

  const addQuestion = async (compId) => {
    if (!qText) return
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competencyId: compId, text: qText }), // Removed shortName
    })
    const newQ = await res.json()
    setCompetencies(competencies.map(c => c.id === compId ? { ...c, questions: [...(c.questions || []), newQ] } : c))
    setQText("")
    setActiveCompId(null)
  }

  return (
    <div className="flex gap-6 min-h-screen bg-gray-50 p-6">
      {/* LEFT SIDEBAR */}
      <div className="w-64 flex-shrink-0 space-y-3">
        <div className="bg-white p-4 rounded shadow border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3">Builder Tools</h3>
          <div className="space-y-2">
            <input 
              placeholder="New Section Name (e.g. Leadership)" 
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            />
            <button onClick={addCompetency} className="w-full bg-amber-100 text-amber-900 border border-amber-300 p-2 rounded font-bold hover:bg-amber-200 flex items-center justify-center gap-2">
              <span>➕</span> Add Section
            </button>
          </div>
          <hr className="my-4"/>
          <button className="w-full bg-amber-100 text-amber-900 border border-amber-300 p-2 rounded font-bold hover:bg-amber-200 flex items-center justify-center gap-2 mb-2">
            <span>📝</span> Add text content
          </button>
          <button className="w-full bg-amber-100 text-amber-900 border border-amber-300 p-2 rounded font-bold hover:bg-amber-200 flex items-center justify-center gap-2">
            <span>⚖️</span> Edit rating scale
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="flex-1 bg-white rounded shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Assessment Structure</h2>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-3 border-b w-1/4">Section / Competency</th>
              <th className="p-3 border-b">Description (Statement to Rate)</th>
              <th className="p-3 border-b w-10">Action</th>
            </tr>
          </thead>
          <tbody>
            {competencies.map((comp) => (
              <tr key={comp.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold text-gray-800 align-top bg-blue-50">
                  {comp.name}
                </td>
                <td className="p-0 align-top">
                  {comp.questions && comp.questions.length > 0 ? (
                    comp.questions.map((q) => (
                      <div key={q.id} className="p-3 border-b last:border-0 text-gray-700">
                        {q.text}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-400 italic">No statements yet.</div>
                  )}
                  
                  {activeCompId === comp.id && (
                    <div className="p-3 bg-yellow-50 border-t flex gap-2">
                      <input 
                        placeholder="Enter description/statement here..." 
                        value={qText}
                        onChange={(e) => setQText(e.target.value)}
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <button onClick={() => addQuestion(comp.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                      <button onClick={() => setActiveCompId(null)} className="text-red-500 px-2 text-sm">Cancel</button>
                    </div>
                  )}
                </td>
                <td className="p-3 align-top">
                  <button 
                    onClick={() => setActiveCompId(activeCompId === comp.id ? null : comp.id)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                  >
                    + Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}