import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { UserAuthGuard } from 'src/auth/guard/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('update')
  async getAllGuildMembers() {
    return this.userService.fetchAllGuildMembers();
  }

  @Get('me')
  @UseGuards(UserAuthGuard)
  async getMe(@Req() req: Request) {
    return req.user;
  }
}
