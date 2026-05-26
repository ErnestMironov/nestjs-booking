'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold text-blue-600 hover:text-blue-700">
        Workshop Booking
      </Link>

      <div className="flex items-center gap-4">
        {loading ? null : user ? (
          <>
            <span className="text-sm text-gray-600">{user.email}</span>
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Админ
              </Link>
            )}
            <Link
              href="/my-bookings"
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              Мои записи
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
