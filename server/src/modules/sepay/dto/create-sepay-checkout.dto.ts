import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateSepayCheckoutDto {
  @ApiProperty({ example: 100000, minimum: 1000 })
  @IsNumber()
  @Min(1000)
  amount: number;
}
