import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldFeature } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFieldDto {
  @ApiProperty({ description: 'Field name (e.g. "Sân 1")' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Price per hour (VND)', example: 85000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @ApiPropertyOptional({
    description: 'Field features',
    enum: FieldFeature,
    isArray: true,
    example: ['LED', 'VIP'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(FieldFeature, { each: true })
  features?: FieldFeature[];
}
