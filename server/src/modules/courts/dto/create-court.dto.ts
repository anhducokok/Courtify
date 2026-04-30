import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCourtDto {
  @ApiProperty({ description: 'Tên sân', example: 'Sân Badminton Thành Đạt' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Địa chỉ sân', example: '123 Nguyễn Trãi, Quận 1, TP.HCM' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ description: 'Vĩ độ (latitude)', example: 10.7769 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ (longitude)', example: 106.7009 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  longitude?: number;
}
