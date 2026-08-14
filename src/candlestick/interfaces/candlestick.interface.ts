export interface CandlestickData {
  x: string | number | Date; // Mốc thời gian (Timestamp hoặc chuỗi ngày)
  open: number;              // Giá mở cửa
  high: number;              // Giá cao nhất
  low: number;               // Giá thấp nhất
  close: number;             // Giá đóng cửa
}