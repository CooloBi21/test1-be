import { Module } from '@nestjs/common';
import { SavedPostsController } from './saved-posts.controller';
import { SavedPostsService } from './saved-posts.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SavedPostsController],
  providers: [SavedPostsService],
})
export class SavedPostsModule {}
