import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { CreateSepayCheckoutDto } from './dto/create-sepay-checkout.dto';
import { SepayService } from './sepay.service';

@ApiTags('sepay')
@ApiBearerAuth('access-token')
@Controller('sepay')
export class SepayController {
  constructor(private readonly sepay: SepayService) {}

  @Post('checkout')
  @ApiOperation({
    summary:
      'Create Sepay hosted checkout: POST formFields as application/x-www-form-urlencoded (or multipart) to initUrl',
  })
  async createCheckout(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSepayCheckoutDto,
  ) {
    return this.sepay.createCheckout(user.id, dto.amount);
  }
}
