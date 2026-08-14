import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DistrictsService } from './districts.service';

@ApiTags('Locations')
@Controller('api/districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả Quận / Huyện' })
  getDistricts() {
    return this.districtsService.getAllDistricts();
  }

  @Get('by-province')
  @ApiOperation({ summary: 'Lấy danh sách Quận / Huyện theo Tỉnh / Thành' })
  @ApiQuery({ name: 'parentCode', required: true, description: 'Mã tỉnh/thành' })
  getDistrictsByProvince(@Query('parentCode') parentCode: string) {
    if (!parentCode) {
      throw new BadRequestException('parentCode là bắt buộc');
    }
    return this.districtsService.getDistrictsByProvince(parentCode);
  }
}