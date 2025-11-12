import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Attendance Portal
          </h1>
          <p className="text-gray-300">
            Manage your attendance and track your work hours
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/login"
            className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/employee/login"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
          >
            Employee Portal
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-sm text-center text-gray-400">
            Use your unique employee link to access your attendance page
          </p>
        </div>
      </div>
    </div>
  );
}
