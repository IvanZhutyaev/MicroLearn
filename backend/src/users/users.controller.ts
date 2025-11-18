import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('me')
  async updateProfile(@Req() req, @Body() data: { firstName?: string; lastName?: string; bio?: string; avatar?: string }) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Get(':id')
  async getUser(@Req() req) {
    return this.usersService.findOne(req.params.id);
  }
}

