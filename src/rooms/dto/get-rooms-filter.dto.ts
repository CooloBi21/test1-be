import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetRoomsFilterDto {
  @ApiPropertyOptional({ description: 'Mã tỉnh thành' })
  city?: string;

  @ApiPropertyOptional({ description: 'Mã quận huyện' })
  district?: string;

  @ApiPropertyOptional({ description: 'Giá tối thiểu (VNĐ)' })
  minPrice?: string;

  @ApiPropertyOptional({ description: 'Giá tối đa (VNĐ)' })
  maxPrice?: string;

  @ApiPropertyOptional({ description: 'Diện tích tối thiểu (m²)' })
  minArea?: string;

  @ApiPropertyOptional({ description: 'Diện tích tối đa (m²)' })
  maxArea?: string;
}