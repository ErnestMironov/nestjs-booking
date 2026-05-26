'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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

interface WorkshopForm {
  title: string;
  description: string;
  date: string; // datetime-local format: "YYYY-MM-DDTHH:mm"
  capacity: number;
  imageUrl: string;
}

const emptyForm: WorkshopForm = {
  title: '',
  description: '',
  date: '',
  capacity: 1,
  imageUrl: '',
};

export default function AdminWorkshopsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<WorkshopForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [loading, user, router]);

  // Fetch workshops
  async function fetchWorkshops() {
    setFetching(true);
    setFetchError(null);
    try {
      const data = await api.get<Workshop[]>('/workshops');
      setWorkshops(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      fetchWorkshops();
    }
  }, [loading, user]);

  // Modal helpers
  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setSubmitError(null);
    setModalOpen(true);
  }

  function openEditModal(workshop: Workshop) {
    setEditingId(workshop.id);
    setForm({
      title: workshop.title,
      description: workshop.description,
      date: new Date(workshop.date).toISOString().slice(0, 16),
      capacity: workshop.capacity,
      imageUrl: workshop.imageUrl ?? '',
    });
    setSubmitError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setSubmitError(null);
  }

  // Submit (create or update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      capacity: Number(form.capacity),
      ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
    };

    try {
      if (editingId !== null) {
        await api.put(`/workshops/${editingId}`, payload);
      } else {
        await api.post('/workshops', payload);
      }
      closeModal();
      await fetchWorkshops();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  }

  // Delete
  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Удалить мастер-класс «${title}»?`)) return;
    try {
      await api.delete(`/workshops/${id}`);
      setWorkshops((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  }

  // Render states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Управление мастер-классами
        </h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          + Добавить
        </button>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {fetchError}
          <button
            onClick={fetchWorkshops}
            className="ml-3 underline hover:no-underline"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Название
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Дата
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Вместимость
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Мест осталось
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : workshops.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Мастер-классов пока нет
                </td>
              </tr>
            ) : (
              workshops.map((workshop) => (
                <tr
                  key={workshop.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {workshop.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(workshop.date).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {workshop.capacity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        workshop.spotsLeft === 0
                          ? 'text-red-600'
                          : workshop.spotsLeft <= 3
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {workshop.spotsLeft}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(workshop)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(workshop.id, workshop.title)
                        }
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {editingId !== null
                ? 'Редактировать мастер-класс'
                : 'Добавить мастер-класс'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Название мастер-класса"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Описание мастер-класса"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата и время <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Вместимость <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      capacity: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL изображения{' '}
                  <span className="text-gray-400 font-normal">(необязательно)</span>
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Submit error */}
              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Сохранение...'
                    : editingId !== null
                    ? 'Сохранить'
                    : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
