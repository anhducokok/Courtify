import { ApiPropertyOptional } from '@nestjs/swagger';
import { FieldFeature } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class QueryFieldsDto {
  @ApiPropertyOptional({ description: 'Filter by court UUID' })
  @IsOptional()
  @IsString()
  @IsUUID()
  courtId?: string;

  @ApiPropertyOptional({ description: 'Minimum price per hour (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price per hour (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description:
      'Filter fields that have ALL of these features (comma-separated)',
    enum: FieldFeature,
    isArray: true,
    example: ['LED', 'VIP'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',');
    return value;
  })
  @IsArray()
  @IsEnum(FieldFeature, { each: true })
  features?: FieldFeature[];

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
