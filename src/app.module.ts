import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProvincesModule } from './provinces/provinces.module';
import { DistrictsModule } from './districts/districts.module';
import { RoomsModule } from './rooms/rooms.module';
import { CandlestickModule } from './candlestick/candlestick.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SavedPostsModule } from './saved-posts/saved-posts.module';
import { RoomViewsModule } from './room-views/room-views.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DatabaseModule,
    ProvincesModule,
    DistrictsModule,
    RoomsModule,
    CandlestickModule,
    SavedPostsModule,
    RoomViewsModule,
    ReviewsModule,
    ChatModule,
    NotificationsModule,
  ],
})
export class AppModule {}