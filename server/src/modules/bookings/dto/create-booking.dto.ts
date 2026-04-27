import { IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Field UUID' })
  @IsString()
  fieldId: string;

  @ApiProperty({ description: 'TimeSlot UUID' })
  @IsString()
  timeSlotId: string;

  @ApiProperty({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsDateString()
  date: string;
}
