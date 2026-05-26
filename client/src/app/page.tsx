import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Workshop Booking</h1>
        <p className="text-gray-600 mb-8">Система бронирования мастер-классов</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
