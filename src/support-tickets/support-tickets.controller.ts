import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/support-tickets')
export class SupportTicketsController {
  constructor(private readonly ticketsService: SupportTicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTicket(@Request() req, @Body() body: { category: any; message: string }) {
    return this.ticketsService.createTicket(req.user.id, body.category, body.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-tickets')
  async getMyTickets(@Request() req) {
    return this.ticketsService.getUserTickets(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  async getAdminTickets(@Query('status') status?: any) {
    return this.ticketsService.getAdminTickets(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/:id')
  async replyTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { admin_reply: string; status: any },
  ) {
    return this.ticketsService.replyTicket(id, body.admin_reply, body.status);
  }
}