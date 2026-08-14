"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandlestickService = void 0;
const common_1 = require("@nestjs/common");
let CandlestickService = class CandlestickService {
    getCandlestickData() {
        return [
            { x: '2026-08-01', open: 150.0, high: 155.5, low: 148.0, close: 153.2 },
            { x: '2026-08-02', open: 153.2, high: 158.0, low: 151.0, close: 156.8 },
            { x: '2026-08-03', open: 156.8, high: 157.5, low: 149.2, close: 150.5 },
            { x: '2026-08-04', open: 150.5, high: 162.0, low: 150.0, close: 160.4 },
            { x: '2026-08-05', open: 160.4, high: 165.0, low: 158.5, close: 163.0 },
        ];
    }
};
exports.CandlestickService = CandlestickService;
exports.CandlestickService = CandlestickService = __decorate([
    (0, common_1.Injectable)()
], CandlestickService);
//# sourceMappingURL=candlestick.service.js.map