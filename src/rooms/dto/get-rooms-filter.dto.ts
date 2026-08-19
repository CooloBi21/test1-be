import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRoomsFilterDto {
  @ApiPropertyOptional({ description: 'ID người đăng bài' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ description: 'Mã tỉnh thành' })
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Mã quận huyện' })
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: 'Giá tối thiểu (VNĐ)' })
  @IsOptional()
  minPrice?: string;

  @ApiPropertyOptional({ description: 'Giá tối đa (VNĐ)' })
  @IsOptional()
  maxPrice?: string;

  @ApiPropertyOptional({ description: 'Diện tích tối thiểu (m²)' })
  @IsOptional()
  minArea?: string;

  @ApiPropertyOptional({ description: 'Diện tích tối đa (m²)' })
  @IsOptional()
  maxArea?: string;
}