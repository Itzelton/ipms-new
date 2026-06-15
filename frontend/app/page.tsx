import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">IPMS</h1>
        <p className="text-gray-600">Intelligent Project Monitoring System</p>
        <div className="space-x-2">
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Login</Link>
        </div>
      </div>
    </main>
  );
}
