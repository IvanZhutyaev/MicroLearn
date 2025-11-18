import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFiltersDto } from './dto/course-filters.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, authorId: string) {
    const totalDuration = createCourseDto.modules.reduce(
      (sum, module) => sum + module.lessons.reduce((s, lesson) => s + lesson.duration, 0),
      0,
    );

    const course = await this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        thumbnail: createCourseDto.thumbnail,
        category: createCourseDto.category,
        level: createCourseDto.level,
        price: createCourseDto.price,
        duration: totalDuration,
        authorId,
        modules: {
          create: createCourseDto.modules.map((module) => ({
            title: module.title,
            order: module.order,
            lessons: {
              create: module.lessons.map((lesson) => ({
                title: lesson.title,
                order: lesson.order,
                duration: lesson.duration,
                isFree: lesson.isFree || false,
                content: {
                  create: lesson.content.map((content) => ({
                    type: content.type,
                    content: content.content,
                    url: content.url,
                    duration: content.duration,
                    order: content.order,
                    quiz: content.quiz
                      ? {
                          create: {
                            passingScore: content.quiz.passingScore,
                            questions: {
                              create: content.quiz.questions.map((q) => ({
                                type: q.type,
                                question: q.question,
                                options: q.options,
                                correctAnswer: q.correctAnswer,
                              })),
                            },
                          },
                        }
                      : undefined,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        modules: {
          include: {
            lessons: {
              include: {
                content: {
                  include: {
                    quiz: {
                      include: {
                        questions: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return course;
  }

  async findAll(filters: CourseFiltersDto, userId?: string) {
    const where: any = {
      isPublished: true,
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              progress: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    const coursesWithStats = courses.map((course) => {
      const avgRating =
        course.ratings.length > 0
          ? course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length
          : 0;

      return {
        ...course,
        averageRating: avgRating,
        totalStudents: course._count.progress,
        ratings: undefined,
        _count: undefined,
      };
    });

    return {
      courses: coursesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                content: {
                  orderBy: { order: 'asc' },
                  include: {
                    quiz: {
                      include: {
                        questions: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const avgRating =
      course.ratings.length > 0
        ? course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length
        : 0;

    return {
      ...course,
      averageRating: avgRating,
      totalRatings: course.ratings.length,
    };
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.authorId !== userId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return { message: 'Course deleted successfully' };
  }

  async publish(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                content: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.authorId !== userId) {
      throw new ForbiddenException('You can only publish your own courses');
    }

    if (course.modules.length === 0) {
      throw new BadRequestException('Course must have at least one module');
    }

    return this.prisma.course.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async getLessons(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                content: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course.modules.flatMap((module) => module.lessons);
  }

  async getLessonById(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { order: 'asc' },
                  include: {
                    lessons: {
                      orderBy: { order: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
        content: {
          orderBy: { order: 'asc' },
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Find previous and next lessons
    const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return {
      ...lesson,
      previous: previousLesson,
      next: nextLesson,
    };
  }
}

