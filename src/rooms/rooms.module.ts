import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [RoomsController, AdminController],
  providers: [RoomsService],
})
export class RoomsModule {}