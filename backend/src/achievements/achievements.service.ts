import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async checkAndAwardAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        lessonProgress: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!user) {
      return;
    }

    const completedLessons = user.lessonProgress.filter((lp) => lp.isCompleted).length;
    const completedCourses = user.progress.filter((p) => p.progress === 100).length;
    const perfectQuizzes = user.lessonProgress.filter((lp) => lp.quizScore === 100).length;

    // Get all achievements
    const allAchievements = await this.prisma.achievement.findMany();
    const earnedAchievementIds = user.achievements.map((ua) => ua.achievementId);

    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (earnedAchievementIds.includes(achievement.id)) {
        continue;
      }

      const condition = JSON.parse(achievement.condition);
      let shouldAward = false;

      switch (achievement.type) {
        case 'lessons_completed':
          if (completedLessons >= condition.count) {
            shouldAward = true;
          }
          break;
        case 'courses_completed':
          if (completedCourses >= condition.count) {
            shouldAward = true;
          }
          break;
        case 'perfect_quiz':
          if (perfectQuizzes >= condition.count) {
            shouldAward = true;
          }
          break;
        case 'login_streak':
          // TODO: Implement login streak tracking
          break;
      }

      if (shouldAward) {
        await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            earnedAt: new Date(),
            progress: 100,
          },
        });

        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });
  }

  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: {
        points: 'desc',
      },
    });
  }

  async getUserPoints(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
    });

    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + (ua.achievement.points || 0),
      0,
    );

    return {
      totalPoints,
      achievementsCount: userAchievements.length,
    };
  }
}

