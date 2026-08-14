import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProvincesModule } from './provinces/provinces.module';
import { DistrictsModule } from './districts/districts.module';
import { RoomsModule } from './rooms/rooms.module';
import { CandlestickModule } from './candlestick/candlestick.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProvincesModule,
    DistrictsModule,
    RoomsModule,
    CandlestickModule, // Import module giúp code sạch và chuẩn cấu trúc NestJS
  ],
})
export class AppModule {}