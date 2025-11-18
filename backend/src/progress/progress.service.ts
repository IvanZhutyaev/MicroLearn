import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLessonProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getCourseProgress(userId: string, courseId: string) {
    const progress = await this.prisma.userProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!progress) {
      // Initialize progress if not exists
      return this.prisma.userProgress.create({
        data: {
          userId,
          courseId,
          progress: 0,
          timeSpent: 0,
        },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: true,
                },
              },
            },
          },
        },
      });
    }

    return progress;
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    updateDto: UpdateLessonProgressDto,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const existingProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    const lessonProgress = existingProgress
      ? await this.prisma.lessonProgress.update({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
          data: {
            ...updateDto,
            lastActivity: new Date(),
          },
        })
      : await this.prisma.lessonProgress.create({
          data: {
            userId,
            lessonId,
            ...updateDto,
            lastActivity: new Date(),
          },
        });

    // Update course progress
    if (updateDto.isCompleted) {
      await this.updateCourseProgress(userId, lesson.module.courseId);
    }

    return lessonProgress;
  }

  private async updateCourseProgress(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return;
    }

    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          module: {
            courseId,
          },
        },
      },
    });

    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const courseProgress = await this.prisma.userProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (courseProgress) {
      await this.prisma.userProgress.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          progress,
          currentLessonId: courseProgress.currentLessonId,
          lastActivity: new Date(),
          completedAt: progress === 100 ? new Date() : null,
        },
      });
    } else {
      await this.prisma.userProgress.create({
        data: {
          userId,
          courseId,
          progress,
          lastActivity: new Date(),
          completedAt: progress === 100 ? new Date() : null,
        },
      });
    }
  }

  async getStatistics(userId: string) {
    const [totalCourses, completedCourses, totalLessons, completedLessons, totalTime] =
      await Promise.all([
        this.prisma.userProgress.count({
          where: { userId },
        }),
        this.prisma.userProgress.count({
          where: {
            userId,
            progress: 100,
          },
        }),
        this.prisma.lessonProgress.count({
          where: { userId },
        }),
        this.prisma.lessonProgress.count({
          where: {
            userId,
            isCompleted: true,
          },
        }),
        this.prisma.userProgress.aggregate({
          where: { userId },
          _sum: {
            timeSpent: true,
          },
        }),
      ]);

    return {
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      totalTimeSpent: totalTime._sum.timeSpent || 0,
      completionRate:
        totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0,
    };
  }

  async markLessonCompleted(userId: string, lessonId: string) {
    return this.updateLessonProgress(userId, lessonId, { isCompleted: true });
  }
}

