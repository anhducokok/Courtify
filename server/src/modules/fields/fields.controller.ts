import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { FieldsService } from './fields.service';
import { QueryFieldsDto } from './dto/query-fields.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@ApiTags('fields')
@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  // ── Public endpoints ──────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'List fields with optional filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of fields' })
  findAll(@Query() query: QueryFieldsDto) {
    return this.fieldsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single field by ID' })
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiResponse({ status: 200, description: 'Field object with court info' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  findOne(@Param('id') id: string) {
    return this.fieldsService.findOne(id);
  }

  @Get(':id/availability')
  @Public()
  @ApiOperation({ summary: 'Get available time slots for a field on a given date' })
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiQuery({ name: 'date', required: true, description: 'ISO date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Array of available TimeSlot objects' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  findAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.fieldsService.findAvailability(id, date);
  }

  // ── Authenticated endpoints ───────────────────────────────────

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a field (court owner or admin)' })
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiResponse({ status: 200, description: 'Updated field' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: UpdateFieldDto,
  ) {
    return this.fieldsService.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a field (court owner or admin)' })
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiResponse({ status: 200, description: 'Field deleted' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  @ApiResponse({ status: 409, description: 'Field has active bookings' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.fieldsService.delete(id, user.id, user.role);
  }
}
