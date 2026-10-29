"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      alert("Invalid email or password! Check your .env file.")
    } else {
      alert("Login successful! We will build the dashboard next.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Admin Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4 text-black placeholder-gray-800 font-medium"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-6 text-black placeholder-gray-800 font-medium"
          required
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 text-lg">
          Sign In
        </button>
      </form>
    </div>
  )
}