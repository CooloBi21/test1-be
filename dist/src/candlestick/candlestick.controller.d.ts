import { CandlestickService } from './candlestick.service';
export declare class CandlestickController {
    private readonly candlestickService;
    constructor(candlestickService: CandlestickService);
    getData(): import("./interfaces/candlestick.interface").CandlestickData[];
}
