import { Controller, Post, Get, Delete, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  submitReview(
    @Req() req,
    @Body('room_id', ParseIntPipe) roomId: number,
    @Body('rating', ParseIntPipe) rating: number,
    @Body('comment') comment: string,
  ) {
    return this.reviewsService.upsertReview(req.user.id, roomId, rating, comment);
  }

  @Get('my-reviews')
  getMyReviews(@Req() req) {
    return this.reviewsService.getMyReviews(req.user.id);
  }

  @Get('about-me')
  getReviewsAboutMe(@Req() req) {
    return this.reviewsService.getReviewsAboutMe(req.user.id);
  }

  @Delete(':review_id')
  deleteReview(@Req() req, @Param('review_id', ParseIntPipe) reviewId: number) {
    return this.reviewsService.deleteReview(req.user.id, reviewId);
  }
}