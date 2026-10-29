"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewAssessment() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Send data to our API to save in the database
    const res = await fetch("/api/admin/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
    
    if (res.ok) {
      router.push("/admin") // Go back to dashboard
    } else {
      alert("Failed to create assessment")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Create New Assessment</h2>
        <input
          type="text"
          placeholder="Title (e.g., Leadership 360)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          rows="3"
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Create Assessment
        </button>
      </form>
    </div>
  )
}