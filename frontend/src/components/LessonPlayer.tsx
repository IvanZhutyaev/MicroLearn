'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Lesson } from '@/lib/types';
import { useState, useCallback } from 'react';
import Link from 'next/link';

interface LessonPlayerProps {
  lessonId: string;
}

export default function LessonPlayer({ lessonId }: LessonPlayerProps) {
  const queryClient = useQueryClient();
  const [videoTime, setVideoTime] = useState(0);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await api.get(`/courses/lessons/${lessonId}`);
      return response.data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ['lesson-progress', lessonId],
    queryFn: async () => {
      try {
        // Progress is updated via PUT, so we get it from the lesson data or calculate
        return null;
      } catch {
        return null;
      }
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { timeSpent?: number; isCompleted?: boolean }) => {
      return api.put(`/progress/lessons/${lessonId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
    },
  });

  const handleVideoProgress = useCallback(
    (time: number) => {
      setVideoTime(time);
      updateProgressMutation.mutate({
        timeSpent: Math.floor(time / 60), // Convert to minutes
        watchedVideoTime: Math.floor(time),
      });
    },
    [updateProgressMutation],
  );

  const handleComplete = () => {
    updateProgressMutation.mutate({ isCompleted: true });
  };

  if (isLoading) {
    return <div className="text-center py-12">Загрузка урока...</div>;
  }

  if (!lesson) {
    return <div className="text-center py-12">Урок не найден</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {lesson.content.map((content: any, index: number) => {
            switch (content.type) {
              case 'video':
                return (
                  <div key={index} className="mb-6">
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={content.url || ''}
                      onTimeUpdate={(e) => {
                        const video = e.currentTarget;
                        handleVideoProgress(video.currentTime);
                      }}
                    />
                  </div>
                );
              case 'text':
                return (
                  <div key={index} className="mb-6 bg-white p-6 rounded-lg shadow">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content || '' }} />
                  </div>
                );
              case 'quiz':
                return (
                  <div key={index} className="mb-6 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Тест</h3>
                    {content.quiz && <QuizComponent quiz={content.quiz} onComplete={handleComplete} />}
                  </div>
                );
              case 'audio':
                return (
                  <div key={index} className="mb-6">
                    <audio
                      controls
                      className="w-full"
                      src={content.url || ''}
                    />
                  </div>
                );
              default:
                return null;
            }
          })}

          <div className="mt-6 flex gap-4">
            {lesson.previous && (
              <Link
                href={`/courses/${lesson.module.course.id}/lessons/${lesson.previous.id}`}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                ← Предыдущий урок
              </Link>
            )}
            <button
              onClick={handleComplete}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Отметить урок как пройденный
            </button>
            {lesson.next && (
              <Link
                href={`/courses/${lesson.module.course.id}/lessons/${lesson.next.id}`}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Следующий урок →
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-6">
            <h3 className="font-bold mb-4">Информация об уроке</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Длительность:</span>
                <span className="ml-2 font-semibold">{lesson.duration} мин</span>
              </div>
              <div>
                <span className="text-gray-600">Модуль:</span>
                <span className="ml-2 font-semibold">{lesson.module.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizComponent({ quiz, onComplete }: { quiz: any; onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach((q: any, index: number) => {
      const userAnswer = answers[index];
      const correctAnswer = JSON.parse(q.correctAnswer);

      if (q.type === 'single' || q.type === 'text') {
        if (userAnswer === correctAnswer) correct++;
      } else if (q.type === 'multiple') {
        if (JSON.stringify(userAnswer?.sort()) === JSON.stringify(correctAnswer.sort())) {
          correct++;
        }
      }
    });

    const calculatedScore = (correct / quiz.questions.length) * 100;
    setScore(calculatedScore);
    setSubmitted(true);

    if (calculatedScore >= quiz.passingScore) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {quiz.questions.map((question: any, index: number) => (
        <div key={index} className="border-b pb-4">
          <p className="font-semibold mb-2">{question.question}</p>
          {question.type === 'single' && (
            <div className="space-y-2">
              {question.options.map((option: string, optIndex: number) => (
                <label key={optIndex} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={optIndex}
                    onChange={(e) =>
                      setAnswers({ ...answers, [index]: parseInt(e.target.value) })
                    }
                    disabled={submitted}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
          {question.type === 'multiple' && (
            <div className="space-y-2">
              {question.options.map((option: string, optIndex: number) => (
                <label key={optIndex} className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const current = answers[index] || [];
                      if (e.target.checked) {
                        setAnswers({ ...answers, [index]: [...current, optIndex] });
                      } else {
                        setAnswers({
                          ...answers,
                          [index]: current.filter((i: number) => i !== optIndex),
                        });
                      }
                    }}
                    disabled={submitted}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
          {question.type === 'text' && (
            <input
              type="text"
              onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
              disabled={submitted}
              className="w-full px-3 py-2 border rounded"
            />
          )}
        </div>
      ))}
      {!submitted && (
        <button
          onClick={handleSubmit}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Отправить ответы
        </button>
      )}
      {submitted && (
        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <p className="font-semibold">Ваш результат: {score.toFixed(1)}%</p>
          <p className="text-sm mt-2">
            Проходной балл: {quiz.passingScore}%
            {score >= quiz.passingScore ? ' ✓ Пройдено' : ' ✗ Не пройдено'}
          </p>
        </div>
      )}
    </div>
  );
}

