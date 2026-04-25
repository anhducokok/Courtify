import { IsDateString, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Court UUID' })
  @IsString()
  @IsUUID()
  courtId: string;

  @ApiProperty({ description: 'TimeSlot UUID' })
  @IsString()
  @IsUUID()
  timeSlotId: string;

  @ApiProperty({ description: 'ISO date string (YYYY-MM-DD)' })
  @IsDateString()
  date: string;
}
