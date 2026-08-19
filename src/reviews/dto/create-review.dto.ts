// DTO for creating a review
export class CreateReviewDto {
  room_id: number;
  rating: number;
  comment?: string;
}
