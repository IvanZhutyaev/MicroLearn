import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFiltersDto } from './dto/course-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TeacherGuard)
  create(@Body() createCourseDto: CreateCourseDto, @Req() req) {
    return this.coursesService.create(createCourseDto, req.user.id);
  }

  @Get()
  findAll(@Query() filters: CourseFiltersDto, @Req() req) {
    return this.coursesService.findAll(filters, req.user?.id);
  }

  @Get('lessons/:lessonId')
  getLessonById(@Param('lessonId') lessonId: string) {
    return this.coursesService.getLessonById(lessonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.coursesService.findOne(id, req.user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, TeacherGuard)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Req() req) {
    return this.coursesService.update(id, updateCourseDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TeacherGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.coursesService.remove(id, req.user.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, TeacherGuard)
  publish(@Param('id') id: string, @Req() req) {
    return this.coursesService.publish(id, req.user.id);
  }

  @Get(':id/lessons')
  getLessons(@Param('id') id: string) {
    return this.coursesService.getLessons(id);
  }
}

