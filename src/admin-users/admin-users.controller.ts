import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe, Query, Req } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('api/admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getUsers(@Query('role') role?: string) {
    return this.adminUsersService.getAllUsers(role);
  }

  @Patch(':id/role')
  async updateUserRole(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    const currentUserEmail = req.user?.email;
    return this.adminUsersService.updateUserRole(currentUserEmail, id, role);
  }

  @Patch(':id/ban')
  async banUser(@Param('id', ParseIntPipe) id: number, @Body('reason') reason: string) {
    return this.adminUsersService.banUser(id, reason);
  }

  @Patch(':id/unban')
  async unbanUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminUsersService.unbanUser(id);
  }
}