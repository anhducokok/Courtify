import { Module } from '@nestjs/common';
import { BookingPlansController } from './booking-plans.controller';
import { BookingPlansService } from './booking-plans.service';

@Module({
  controllers: [BookingPlansController],
  providers: [BookingPlansService],
  exports: [BookingPlansService],
})
export class BookingPlansModule {}
