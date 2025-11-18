import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateLessonProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get('courses/:id')
  async getCourseProgress(@Param('id') courseId: string, @Req() req) {
    return this.progressService.getCourseProgress(req.user.id, courseId);
  }

  @Post('lessons/:id')
  async markLessonCompleted(@Param('id') lessonId: string, @Req() req) {
    return this.progressService.markLessonCompleted(req.user.id, lessonId);
  }

  @Put('lessons/:id')
  async updateLessonProgress(
    @Param('id') lessonId: string,
    @Body() updateDto: UpdateLessonProgressDto,
    @Req() req,
  ) {
    return this.progressService.updateLessonProgress(req.user.id, lessonId, updateDto);
  }

  @Get('statistics')
  async getStatistics(@Req() req) {
    return this.progressService.getStatistics(req.user.id);
  }
}

