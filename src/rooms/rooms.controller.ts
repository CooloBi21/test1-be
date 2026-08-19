import { 
  Controller, Get, Post, Put, Delete, Param, Query, Body, 
  UseGuards, Req, UnauthorizedException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Rooms')
@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phòng trọ (Hỗ trợ lọc dữ liệu)' })
  getRooms(@Query() filterDto: GetRoomsFilterDto) {
    return this.roomsService.getRooms(filterDto);
  }

  @Get('my-rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách bài đăng của tôi' })
  getMyRooms(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin xác thực');
    }
    return this.roomsService.getRooms({ userId: Number(userId) } as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết 1 phòng trọ' })
  getRoomById(@Param('id') id: string) {
    return this.roomsService.getRoomById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo phòng trọ mới' })
  createRoom(@Body() dto: CreateRoomDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('Không thể xác thực thông tin người dùng');
    }

    return this.roomsService.createRoom(dto, Number(userId));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin phòng trọ' })
  updateRoom(@Param('id') id: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa phòng trọ' })
  deleteRoom(@Param('id') id: string) {
    return this.roomsService.deleteRoom(id);
  }
}