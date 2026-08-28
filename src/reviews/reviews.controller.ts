import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  submitReview(
    @Req() req,
    @Body('room_id', ParseIntPipe) roomId: number,
    @Body('rating', ParseIntPipe) rating: number,
    @Body('comment') comment: string,
  ) {
    return this.reviewsService.upsertReview(req.user.id, roomId, rating, comment);
  }

  @Get('room/:room_id')
  getRoomReviews(
    @Param('room_id', ParseIntPipe) roomId: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('viewerId') viewerId?: string,
  ) {
    return this.reviewsService.getRoomReviews(roomId, { sort, filter, viewerId: Number(viewerId || 0) });
  }

  @Patch(':review_id/owner-reply')
  @UseGuards(JwtAuthGuard)
  replyAsOwner(
    @Req() req,
    @Param('review_id', ParseIntPipe) reviewId: number,
    @Body('reply') reply: string,
  ) {
    return this.reviewsService.replyAsOwner(req.user.id, reviewId, reply);
  }

  @Post(':review_id/reactions')
  @UseGuards(JwtAuthGuard)
  toggleReaction(
    @Req() req,
    @Param('review_id', ParseIntPipe) reviewId: number,
    @Body('type') reactionType: string,
  ) {
    return this.reviewsService.toggleReaction(req.user.id, reviewId, reactionType);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  getMyReviews(@Req() req) {
    return this.reviewsService.getMyReviews(req.user.id);
  }

  @Get('about-me')
  @UseGuards(JwtAuthGuard)
  getReviewsAboutMe(@Req() req) {
    return this.reviewsService.getReviewsAboutMe(req.user.id);
  }

  @Delete(':review_id')
  @UseGuards(JwtAuthGuard)
  deleteReview(@Req() req, @Param('review_id', ParseIntPipe) reviewId: number) {
    return this.reviewsService.deleteReview(req.user.id, reviewId);
  }
}