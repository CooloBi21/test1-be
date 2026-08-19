import { Module } from '@nestjs/common';
import { RoomViewsController } from './room-views.controller';
import { RoomViewsService } from './room-views.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RoomViewsController],
  providers: [RoomViewsService],
})
export class RoomViewsModule {}
