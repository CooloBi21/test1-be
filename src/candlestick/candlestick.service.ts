import { Injectable } from '@nestjs/common';
import { CandlestickData } from './interfaces/candlestick.interface';

@Injectable()
export class CandlestickService {
  getCandlestickData(): CandlestickData[] {
    // Dữ liệu mẫu OHLC (Thực tế bạn sẽ Query từ DB hoặc Gọi API chứng khoán/crypto)
    return [
      { x: '2026-08-01', open: 150.0, high: 155.5, low: 148.0, close: 153.2 },
      { x: '2026-08-02', open: 153.2, high: 158.0, low: 151.0, close: 156.8 },
      { x: '2026-08-03', open: 156.8, high: 157.5, low: 149.2, close: 150.5 },
      { x: '2026-08-04', open: 150.5, high: 162.0, low: 150.0, close: 160.4 },
      { x: '2026-08-05', open: 160.4, high: 165.0, low: 158.5, close: 163.0 },
    ];
  }
}