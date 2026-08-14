import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: 'Tiêu đề phòng trọ' })
  title: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện' })
  thumbnail?: string;

  @ApiProperty({ description: 'Giá phòng (VNĐ)' })
  price: number;

  @ApiProperty({ description: 'Diện tích (m²)' })
  area: number;

  @ApiProperty({ description: 'Mã tỉnh thành' })
  city: string;

  @ApiProperty({ description: 'Mã quận huyện' })
  district: string;

  @ApiPropertyOptional({ description: 'Nội dung chi tiết' })
  content?: string;
}