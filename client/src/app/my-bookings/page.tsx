'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Booking {
  id: number;
  workshopId: number;
  createdAt: string;
  workshop: {
    id: number;
    title: string;
    date: string;
    imageUrl: string | null;
  };
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    api
      .get<Booking[]>('/bookings/my')
      .then(setBookings)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Ошибка загрузки'),
      )
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function handleCancel(id: number) {
    if (!window.confirm('Отменить запись?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Ошибка при отмене');
    }
  }

  if (authLoading || (loading && user)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-600 mb-4">Войдите чтобы увидеть брони</p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Войти
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Мои записи</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">У вас нет броней</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline text-sm"
          >
            Посмотреть мастер-классы
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => {
            const formattedDate = new Date(booking.workshop.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const imageSrc =
              booking.workshop.imageUrl ??
              `https://picsum.photos/seed/workshop-${booking.workshop.id}/80/80`;

            return (
              <li
                key={booking.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <img
                  src={imageSrc}
                  alt={booking.workshop.title}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/workshops/${booking.workshop.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                  >
                    {booking.workshop.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
                </div>
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="shrink-0 text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
                >
                  Отменить
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
