import { 
  Controller, 
  Get,
  Put, 
  Param, 
  Body, 
  UseGuards, 
  ParseIntPipe, 
  BadRequestException 
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoomsService } from '../rooms/rooms.service';

export class UpdateRoomStatusDto {
  @ApiProperty({
    example: 'approved',
    enum: ['approved', 'rejected'],
    description: 'Trạng thái mới của bài đăng',
  })
  status: 'approved' | 'rejected';
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/admin')
export class AdminController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllRoomsForAdmin() {
    return await this.roomsService.findAllForAdmin();
  }

  @Put('rooms/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBody({ type: UpdateRoomStatusDto })
  async updateRoomStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Body('status') status: 'approved' | 'rejected',
  ) {
    const validStatuses = ['approved', 'rejected'];

    if (!status || !validStatuses.includes(status)) {
      throw new BadRequestException('Status không hợp lệ. Chỉ chấp nhận approved hoặc rejected');
    }

    return this.roomsService.updateRoomStatus(id, status);
  }
}