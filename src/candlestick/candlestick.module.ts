import { Module } from '@nestjs/common';
import { CandlestickController } from './candlestick.controller';
import { CandlestickService } from './candlestick.service';

@Module({
  controllers: [CandlestickController],
  providers: [CandlestickService],
})
export class CandlestickModule {}