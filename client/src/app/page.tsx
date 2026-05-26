'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Workshop {
  id: number;
  title: string;
  description: string;
  date: string;
  capacity: number;
  spotsLeft: number;
  imageUrl: string | null;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-200 w-full" />
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Workshop[]>('/workshops')
      .then(setWorkshops)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Ошибка загрузки'),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Мастер-классы</h1>
      <p className="text-gray-500 mb-8">Выберите и запишитесь на интересующий вас мастер-класс</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {loading
          ? [1, 2, 3].map((n) => <SkeletonCard key={n} />)
          : workshops.map((w) => (
              <Link
                key={w.id}
                href={`/workshops/${w.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition"
              >
                <img
                  src={w.imageUrl ?? `https://picsum.photos/seed/workshop-${w.id}/600/240`}
                  alt={w.title}
                  className="w-full h-36 object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                      {w.title}
                    </h2>
                    {w.spotsLeft > 0 ? (
                      <span className="shrink-0 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Мест: {w.spotsLeft}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Мест нет
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    {new Date(w.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {w.description}
                  </p>
                </div>
              </Link>
            ))}

        {!loading && workshops.length === 0 && !error && (
          <p className="text-gray-500 col-span-2 text-center py-12">
            Пока нет доступных мастер-классов
          </p>
        )}
      </div>
    </div>
  );
}
