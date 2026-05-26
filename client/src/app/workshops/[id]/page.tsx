'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Workshop {
  id: number;
  title: string;
  description: string;
  date: string;
  capacity: number;
  spotsLeft: number;
  imageUrl: string | null;
}

interface Booking {
  id: number;
  workshopId: number;
}

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  /** ID существующей брони пользователя на этот воркшоп (если есть) */
  const [existingBookingId, setExistingBookingId] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<Workshop>(`/workshops/${id}`)
      .then(setWorkshop)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Ошибка загрузки'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  /** Проверяем, записан ли пользователь на этот воркшоп */
  useEffect(() => {
    if (!user || user.role === 'admin') return;
    api
      .get<Booking[]>('/bookings/my')
      .then((bookings) => {
        const found = bookings.find((b) => b.workshopId === Number(id));
        if (found) setExistingBookingId(found.id);
      })
      .catch(() => {});
  }, [user, id]);

  if (loading || authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          ← Назад к списку
        </Link>
      </div>
    );
  }

  if (!workshop) return null;

  const formattedDate = new Date(workshop.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const alreadyBooked = existingBookingId !== null || bookingSuccess;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Все мастер-классы
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <img
          src={workshop.imageUrl ?? `https://picsum.photos/seed/workshop-${workshop.id}/900/300`}
          alt={workshop.title}
          className="w-full h-56 object-cover"
        />
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{workshop.title}</h1>
            {workshop.spotsLeft > 0 ? (
              <span className="shrink-0 text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                Мест: {workshop.spotsLeft}
              </span>
            ) : (
              <span className="shrink-0 text-sm font-medium bg-red-100 text-red-600 px-3 py-1 rounded-full">
                Мест нет
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-700">Дата:</span> {formattedDate}
            </div>
            <div>
              <span className="font-medium text-gray-700">Вместимость:</span> {workshop.capacity} чел.
            </div>
            <div>
              <span className="font-medium text-gray-700">Свободных мест:</span> {workshop.spotsLeft}
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
            {workshop.description}
          </p>

          {user?.role === 'admin' ? (
            <Link
              href="/admin/workshops"
              className="block w-full text-center bg-gray-700 text-white py-2.5 rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Управление мастер-классами →
            </Link>
          ) : user ? (
            alreadyBooked ? (
              <div className="w-full text-center bg-green-50 text-green-700 py-2.5 rounded-lg font-medium border border-green-200">
                Вы записаны на этот мастер-класс ✓
              </div>
            ) : workshop.spotsLeft > 0 ? (
              <div>
                <button
                  onClick={async () => {
                    setBookingLoading(true);
                    setBookingError('');
                    try {
                      await api.post('/bookings', { workshopId: workshop.id });
                      setBookingSuccess(true);
                    } catch (err: unknown) {
                      setBookingError(err instanceof Error ? err.message : 'Ошибка при записи');
                    } finally {
                      setBookingLoading(false);
                    }
                  }}
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Загрузка...' : 'Записаться'}
                </button>
                {bookingError && (
                  <p className="mt-2 text-sm text-red-600 text-center">{bookingError}</p>
                )}
              </div>
            ) : (
              <div className="w-full text-center bg-gray-100 text-gray-500 py-2.5 rounded-lg font-medium">
                Мест нет
              </div>
            )
          ) : (
            <Link
              href="/login"
              className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Войти чтобы записаться
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
