'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Course, Module } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: async () => {
      try {
        const response = await api.get(`/progress/courses/${courseId}`);
        return response.data;
      } catch {
        return null;
      }
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/payments/create-intent', { courseId });
      return response.data;
    },
  });

  const handlePurchase = async () => {
    try {
      const { clientSecret } = await purchaseMutation.mutateAsync();
      // TODO: Integrate Stripe payment element
      alert('Payment integration coming soon!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create payment');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Загрузка...</div>;
  }

  if (!course) {
    return <div className="container mx-auto p-6 text-center">Курс не найден</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <div className="flex gap-4 mb-4 text-gray-600">
            <span>Автор: {course.author.firstName} {course.author.lastName}</span>
            <span>•</span>
            <span>{course.duration} минут</span>
            <span>•</span>
            <span>{course.level}</span>
          </div>
          {course.averageRating && (
            <div className="mb-4">
              <span className="text-yellow-500">★</span>
              <span className="ml-2">{course.averageRating.toFixed(1)}</span>
              <span className="text-gray-500 ml-2">({course.totalRatings} отзывов)</span>
            </div>
          )}
          <p className="text-gray-700 mb-6">{course.description}</p>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Программа курса</h2>
            {course.modules?.map((module: Module) => (
              <div key={module.id} className="mb-4 border rounded-lg p-4">
                <button
                  onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                  className="w-full text-left flex justify-between items-center"
                >
                  <h3 className="font-semibold text-lg">{module.title}</h3>
                  <span>{selectedModule === module.id ? '▼' : '▶'}</span>
                </button>
                {selectedModule === module.id && (
                  <div className="mt-4 space-y-2">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{lesson.order}.</span>
                          <span>{lesson.title}</span>
                          {lesson.isFree && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Бесплатно</span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">{lesson.duration} мин</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                ${course.price}
              </div>
              {course.price === 0 && (
                <div className="text-green-600 font-semibold">Бесплатно</div>
              )}
            </div>

            {progress && (
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Прогресс</span>
                  <span className="font-semibold">{progress.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}

            {course.price > 0 ? (
              <button
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {purchaseMutation.isPending ? 'Обработка...' : 'Купить курс'}
              </button>
            ) : (
              <Link
                href={`/courses/${courseId}/lessons/${course.modules[0]?.lessons[0]?.id}`}
                className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-center"
              >
                Начать обучение
              </Link>
            )}

            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <div>✓ Пожизненный доступ</div>
              <div>✓ Сертификат по завершении</div>
              <div>✓ Поддержка автора</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

