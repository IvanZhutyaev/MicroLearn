import { IsString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Category, CourseLevel } from '@prisma/client';

class CreateModuleDto {
  @IsString()
  title: string;

  @IsNumber()
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}

class CreateLessonContentDto {
  @IsString()
  type: 'text' | 'video' | 'quiz' | 'audio';

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsNumber()
  order: number;

  @IsOptional()
  quiz?: CreateQuizDto;
}

class CreateQuizDto {
  @IsNumber()
  @Min(0)
  passingScore: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}

class CreateQuestionDto {
  @IsString()
  type: 'single' | 'multiple' | 'text';

  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  correctAnswer: string;
}

class CreateLessonDto {
  @IsString()
  title: string;

  @IsNumber()
  order: number;

  @IsNumber()
  @Min(0)
  duration: number;

  @IsOptional()
  @IsNumber()
  isFree?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonContentDto)
  content: CreateLessonContentDto[];
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  thumbnail: string;

  @IsEnum(Category)
  category: Category;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules: CreateModuleDto[];
}

