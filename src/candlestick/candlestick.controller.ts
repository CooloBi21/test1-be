import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CandlestickService } from './candlestick.service';

@ApiTags('Candlestick')
@Controller('candlestick')
export class CandlestickController {
  constructor(private readonly candlestickService: CandlestickService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ nến (OHLC)' })
  getData() {
    return this.candlestickService.getCandlestickData();
  }
}