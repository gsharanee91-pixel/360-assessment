import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">360° Assessment Platform</h1>
        <p className="text-xl text-gray-900 mb-8">
          A SpiderGap-style tool for multi-rater feedback and development.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}