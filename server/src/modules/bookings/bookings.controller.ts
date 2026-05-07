import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('bookings')
@ApiBearerAuth('access-token')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 409, description: 'Time slot already booked' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings (own for USER, all for ADMIN)' })
  @ApiResponse({ status: 200, description: 'Paginated list of bookings' })
  findAll(
    @CurrentUser() user: { id: string; role: Role },
    @Query() query: QueryBookingsDto,
  ) {
    return this.bookingsService.findAll(user.id, user.role, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking object' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.bookingsService.findOne(id, user.id, user.role);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 409, description: 'Already cancelled' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.bookingsService.cancel(id, user.id, user.role);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm a pending booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking confirmed' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 409, description: 'Cannot confirm this booking' })
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.bookingsService.confirm(id, user.id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update booking status (admin only)' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }
}
