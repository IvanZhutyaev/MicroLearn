import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('achievements')
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserAchievements(@Req() req) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Get('all')
  async getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }

  @Get('points')
  @UseGuards(JwtAuthGuard)
  async getUserPoints(@Req() req) {
    return this.achievementsService.getUserPoints(req.user.id);
  }
}

