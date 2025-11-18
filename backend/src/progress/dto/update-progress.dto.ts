import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class UpdateLessonProgressDto {
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quizScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  watchedVideoTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lastPosition?: number;
}

