import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsArray 
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
  @IsNotEmpty({ message: 'Giá phòng không được để trống' })
  price: number;

  @ApiProperty({ description: 'Diện tích (m²)' })
  @IsNumber()
  @IsNotEmpty({ message: 'Diện tích không được để trống' })
  area: number;

  @ApiProperty({ description: 'Mã tỉnh thành' })
  @IsString()
  @IsNotEmpty({ message: 'Mã tỉnh thành không được để trống' })
  city: string;

  @ApiProperty({ description: 'Mã quận huyện' })
  @IsString()
  @IsNotEmpty({ message: 'Mã quận huyện không được để trống' })
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

  @ApiPropertyOptional({ description: 'Danh sÃ¡ch tiá»‡n Ã­ch phÃ²ng', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}
