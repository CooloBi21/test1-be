import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProvincesService } from './provinces.service';

@ApiTags('Locations')
@Controller('api/provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả Tỉnh / Thành phố' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async getProvinces() {
    return await this.provincesService.getAllProvinces();
  }
}