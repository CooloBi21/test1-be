import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@ApiTags('Rooms')
@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phòng trọ (Hỗ trợ lọc dữ liệu)' })
  getRooms(@Query() filterDto: GetRoomsFilterDto) {
    return this.roomsService.getRooms(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết 1 phòng trọ' })
  getRoomById(@Param('id') id: string) {
    return this.roomsService.getRoomById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo phòng trọ mới' })
  createRoom(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin phòng trọ' })
  updateRoom(@Param('id') id: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.updateRoom(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa phòng trọ' })
  deleteRoom(@Param('id') id: string) {
    return this.roomsService.deleteRoom(id);
  }
}