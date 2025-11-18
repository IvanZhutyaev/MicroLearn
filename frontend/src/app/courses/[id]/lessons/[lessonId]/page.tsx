'use client';

import { useParams, useRouter } from 'next/navigation';
import LessonPlayer from '@/components/LessonPlayer';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  return <LessonPlayer lessonId={lessonId} />;
}

