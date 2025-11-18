'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { UserProgress, Course } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: progress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const response = await api.get('/progress/statistics');
      return response.data;
    },
  });

  const { data: recommended } = useQuery({
    queryKey: ['recommended-courses'],
    queryFn: async () => {
      const response = await api.get('/courses?limit=6');
      return response.data.courses;
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Дашборд</h1>

      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Всего курсов</h3>
            <p className="text-3xl font-bold text-primary-600">{progress.totalCourses}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Завершено</h3>
            <p className="text-3xl font-bold text-green-600">{progress.completedCourses}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Уроков пройдено</h3>
            <p className="text-3xl font-bold text-blue-600">{progress.completedLessons}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Время обучения</h3>
            <p className="text-3xl font-bold text-purple-600">{progress.totalTimeSpent} мин</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Рекомендуемые курсы</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommended?.map((course: Course) => (
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
      </div>
    </div>
  );
}

