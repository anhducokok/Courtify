import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFieldBookingPlanDto {
  @ApiProperty({ description: 'Plan type', enum: PlanType })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiPropertyOptional({ description: 'Priority (higher overrides lower)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiProperty({ description: 'Start time in minutes from midnight (e.g., 480 = 08:00)', example: 480 })
  @IsInt()
  @Min(0)
  @Max(1439)
  startTime: number;

  @ApiProperty({ description: 'End time in minutes from midnight (e.g., 1080 = 18:00)', example: 1080 })
  @IsInt()
  @Min(1)
  @Max(1440)
  endTime: number;

  @ApiPropertyOptional({ description: 'Timezone', default: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Whether this plan recurs weekly',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Days of week [0-6], 1=Mon, 0=Sun (required if isRecurring=true)',
    example: [1, 2, 3, 4, 5],
    type: Number,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({
    description: 'Specific date for exception plan (required if isRecurring=false)',
    example: '2026-05-01',
  })
  @IsOptional()
  @IsDateString()
  specificDate?: string;

  @ApiPropertyOptional({
    description: 'Price override in VND (required when type = CUSTOM_PRICE)',
    example: 150000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceOverride?: number;
}

export class UpdateFieldBookingPlanDto {
  @ApiPropertyOptional({ description: 'Plan type', enum: PlanType })
  @IsOptional()
  @IsEnum(PlanType)
  type?: PlanType;

  @ApiPropertyOptional({ description: 'Priority (higher overrides lower)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ description: 'Start time in minutes from midnight' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  startTime?: number;

  @ApiPropertyOptional({ description: 'End time in minutes from midnight' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  endTime?: number;

  @ApiPropertyOptional({ description: 'Timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Whether this plan recurs weekly' })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Days of week [0-6], 1=Mon, 0=Sun',
    type: Number,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({ description: 'Specific date for exception plan' })
  @IsOptional()
  @IsDateString()
  specificDate?: string;

  @ApiPropertyOptional({ description: 'Price override in VND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceOverride?: number;
}

export class GetAvailabilityQueryDto {
  @ApiProperty({ description: 'Date in YYYY-MM-DD format', example: '2026-05-01' })
  @IsDateString()
  date: string;
}
