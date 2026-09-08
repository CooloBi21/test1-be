import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsArray,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Tiêu đề phòng trọ' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ description: 'Giá phòng (VNĐ)' })
  @IsNumber()
  @IsPositive({ message: 'Giá phòng phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Giá phòng không được để trống' })
  price: number;

  @ApiProperty({ description: 'Diện tích (m²)' })
  @IsNumber()
  @IsPositive({ message: 'Diện tích phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Diện tích không được để trống' })
  area: number;

  @ApiProperty({ description: 'Mã tỉnh thành' })
  @IsString()
  @IsNotEmpty({ message: 'Mã tỉnh thành không được để trống' })
  @MaxLength(20, { message: 'Mã tỉnh thành không được vượt quá 20 ký tự' })
  city: string;

  @ApiProperty({ description: 'Mã quận huyện' })
  @IsString()
  @IsNotEmpty({ message: 'Mã quận huyện không được để trống' })
  @MaxLength(20, { message: 'Mã quận huyện không được vượt quá 20 ký tự' })
  district: string;

  @ApiPropertyOptional({ description: 'Nội dung chi tiết' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Danh sách URL ảnh', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Danh sách tiện ích phòng', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}
