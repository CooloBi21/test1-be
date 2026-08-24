import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  @IsNotEmpty()
  room_id: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}