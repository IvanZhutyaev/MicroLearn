export enum UserRole {
  student = 'student',
  teacher = 'teacher',
}

export enum CourseLevel {
  beginner = 'beginner',
  intermediate = 'intermediate',
  advanced = 'advanced',
}

export enum Category {
  programming = 'programming',
  design = 'design',
  business = 'business',
  marketing = 'marketing',
  language = 'language',
  other = 'other',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: Category;
  level: CourseLevel;
  price: number;
  duration: number;
  isPublished: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  averageRating?: number;
  totalRatings?: number;
  totalStudents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  duration: number;
  isFree: boolean;
  content: LessonContent[];
}

export type LessonContent =
  | { type: 'text'; content: string; order: number }
  | { type: 'video'; url: string; duration: number; order: number }
  | { type: 'quiz'; quiz: Quiz; order: number }
  | { type: 'audio'; url: string; duration: number; order: number };

export interface Quiz {
  id: string;
  passingScore: number;
  questions: Question[];
}

export type Question =
  | { type: 'single'; question: string; options: string[]; correctAnswer: string }
  | { type: 'multiple'; question: string; options: string[]; correctAnswers: string[] }
  | { type: 'text'; question: string; correctAnswer: string };

export interface UserProgress {
  userId: string;
  courseId: string;
  progress: number;
  timeSpent: number;
  currentLessonId?: string;
  completedAt?: string;
  lastActivity: string;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  timeSpent: number;
  quizScore?: number;
  watchedVideoTime?: number;
  lastPosition?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  points: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  progress?: number;
  earnedAt?: string;
  achievement: Achievement;
}

