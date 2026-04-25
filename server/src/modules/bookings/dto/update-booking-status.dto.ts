import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
