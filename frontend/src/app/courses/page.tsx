'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';

export default function CoursesPage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      params.append('page', filters.page.toString());
      params.append('limit', '12');

      const response = await api.get(`/courses?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Все курсы</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Поиск курсов..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Все категории</option>
          <option value="programming">Программирование</option>
          <option value="design">Дизайн</option>
          <option value="business">Бизнес</option>
          <option value="marketing">Маркетинг</option>
          <option value="language">Языки</option>
        </select>
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Все уровни</option>
          <option value="beginner">Начинающий</option>
          <option value="intermediate">Средний</option>
          <option value="advanced">Продвинутый</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.courses?.map((course: Course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-bold">${course.price}</span>
                  <span className="text-gray-500 text-sm">{course.duration} мин</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.pagination && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Назад
          </button>
          <span className="px-4 py-2">
            Страница {data.pagination.page} из {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= data.pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
}

