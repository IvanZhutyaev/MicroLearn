import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Добро пожаловать в MicroLearn
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Платформа для микро-обучения с короткими и эффективными уроками
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Перейти к обучению
            </Link>
            <Link
              href="/courses"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-primary-600"
            >
              Просмотреть курсы
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

