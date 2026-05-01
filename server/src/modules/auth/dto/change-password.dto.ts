import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'newPassword456' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}
