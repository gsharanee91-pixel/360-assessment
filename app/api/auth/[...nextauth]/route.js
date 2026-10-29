import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@myapp.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check if email and password match the .env file
        if (credentials.email === process.env.ADMIN_EMAIL && credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: "1", name: "Admin", email: credentials.email }
        }
        return null // Return null if login fails
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }