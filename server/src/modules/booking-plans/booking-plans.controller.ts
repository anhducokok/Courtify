import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Public } from '../../common/decorators';
import { BookingPlansService } from './booking-plans.service';
import {
  CreateFieldBookingPlanDto,
  GetAvailabilityQueryDto,
  UpdateFieldBookingPlanDto,
} from './dto/booking-plan.dto';

@ApiTags('booking-plans')
@Controller()
export class BookingPlansController {
  constructor(private readonly bookingPlansService: BookingPlansService) {}

  // ── Owner/Manager endpoints ──────────────────────────────────────

  @Get('fields/:fieldId/booking-plans')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all booking plans for a field (weekly + exceptions)' })
  @ApiParam({ name: 'fieldId', description: 'Field UUID' })
  @ApiResponse({ status: 200, description: 'Weekly and exception plans' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  findAll(
    @Param('fieldId') fieldId: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.bookingPlansService.findAllByField(fieldId);
  }

  @Post('fields/:fieldId/booking-plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new booking plan for a field' })
  @ApiParam({ name: 'fieldId', description: 'Field UUID' })
  @ApiResponse({ status: 201, description: 'Created plan' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  create(
    @Param('fieldId') fieldId: string,
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: CreateFieldBookingPlanDto,
  ) {
    return this.bookingPlansService.create(fieldId, user.id, user.role, dto);
  }

  @Patch('fields/booking-plans/:planId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a booking plan' })
  @ApiParam({ name: 'planId', description: 'Plan UUID' })
  @ApiResponse({ status: 200, description: 'Updated plan' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  update(
    @Param('planId') planId: string,
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: UpdateFieldBookingPlanDto,
  ) {
    return this.bookingPlansService.update(planId, user.id, user.role, dto);
  }

  @Delete('fields/booking-plans/:planId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a booking plan' })
  @ApiParam({ name: 'planId', description: 'Plan UUID' })
  @ApiResponse({ status: 200, description: 'Plan deleted' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  delete(
    @Param('planId') planId: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.bookingPlansService.delete(planId, user.id, user.role);
  }

  // ── Public booking endpoint ─────────────────────────────────────

  @Get('fields/:fieldId/availability')
  @Public()
  @ApiOperation({
    summary: 'Get resolved availability for a field on a date (minutes-based timeline)',
    description:
      'Returns a timeline of 30-min slots with availability and price, ' +
      'resolved from all applicable booking plans and existing bookings.',
  })
  @ApiParam({ name: 'fieldId', description: 'Field UUID' })
  @ApiQuery({ name: 'date', required: true, description: 'Date in YYYY-MM-DD format', example: '2026-05-01' })
  @ApiResponse({
    status: 200,
    description: 'Array of resolved slots',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          time: { type: 'number', description: 'Minutes from midnight (e.g., 480 = 08:00)' },
          timeStr: { type: 'string', example: '08:00' },
          available: { type: 'boolean' },
          price: { type: 'number', description: 'Price in VND for this slot' },
          blockedReason: { type: 'string', nullable: true },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Field not found' })
  getResolvedAvailability(
    @Param('fieldId') fieldId: string,
    @Query() query: GetAvailabilityQueryDto,
  ) {
    return this.bookingPlansService.getResolvedAvailability(fieldId, query.date);
  }
}
