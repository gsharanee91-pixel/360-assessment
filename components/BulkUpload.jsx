"use client"
import { useState } from "react"
import Papa from "papaparse"

export default function BulkUpload({ assessmentId, assessmentTitle }) {
  const [status, setStatus] = useState("")

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setStatus("Reading file...")
    
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        setStatus("Uploading participants...")
        
        const res = await fetch("/api/admin/participants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            assessmentId, 
            assessmentTitle, 
            participants: results.data 
          }),
        })

        const data = await res.json()
        if (res.ok) {
          setStatus(`✅ Successfully uploaded ${data.count} participants!`)
        } else {
          setStatus("❌ Error uploading participants.")
        }
      },
    })
  }

  return (
    <div className="bg-gray-50 p-4 rounded border mt-4">
      <h3 className="font-bold mb-2 text-black">Upload Participants (CSV)</h3>
      <p className="text-sm text-gray-800 mb-2">
        CSV headers: <code className="bg-gray-200 p-1 rounded">name, email, role</code>
      </p>
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFile} 
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white"
      />
      {status && <p className="mt-2 font-bold text-blue-600">{status}</p>}
    </div>
  )
}