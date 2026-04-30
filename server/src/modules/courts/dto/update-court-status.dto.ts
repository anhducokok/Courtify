import { ApiProperty } from '@nestjs/swagger';
import { CourtStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCourtStatusDto {
  @ApiProperty({ description: 'Trạng thái sân', enum: CourtStatus })
  @IsEnum(CourtStatus)
  status: CourtStatus;
}
