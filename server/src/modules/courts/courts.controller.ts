import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { CourtsService } from './courts.service';
import { QueryCourtsDto } from './dto/query-courts.dto';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtStatusDto } from './dto/update-court-status.dto';
import { FieldsService } from '../fields/fields.service';
import { CreateFieldDto } from '../fields/dto/create-field.dto';

@ApiTags('courts')
@Controller('courts')
export class CourtsController {
  constructor(
    private readonly courtsService: CourtsService,
    private readonly fieldsService: FieldsService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List courts with optional filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of courts' })
  findAll(@Query() query: QueryCourtsDto) {
    return this.courtsService.findAll(query);
  }

  // ── Special routes (must be before :id) ───────────────────────

  @Get('my')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all courts owned by the current user' })
  myCourts(@CurrentUser() user: { id: string }) {
    return this.courtsService.findByOwner(user.id);
  }

  @Get('pending')
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all courts pending approval' })
  @ApiResponse({ status: 200, description: 'List of pending courts' })
  pendingCourts() {
    return this.courtsService.findPending();
  }

  // ── Dynamic routes ─────────────────────────────────────────────

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single court by ID (includes fields)' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiQuery({ name: 'date', required: false, description: 'ISO date (YYYY-MM-DD) to get field bookings count' })
  @ApiResponse({ status: 200, description: 'Court object with fields' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  findOne(@Param('id') id: string, @Query('date') date?: string) {
    return this.courtsService.findOne(id, date);
  }

  // ── Nested field routes ──────────────────────────────────────

  @Get(':id/fields')
  @Public()
  @ApiOperation({ summary: 'List all fields belonging to a court' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiQuery({ name: 'date', required: false, description: 'ISO date (YYYY-MM-DD) to get field bookings count' })
  @ApiResponse({ status: 200, description: 'Array of field objects' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  findFields(@Param('id') id: string, @Query('date') date?: string) {
    return this.fieldsService.findByCourtId(id, date);
  }

  @Post(':id/fields')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new field in this court (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiResponse({ status: 201, description: 'Field created' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  createField(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: CreateFieldDto,
  ) {
    return this.fieldsService.create(user.id, user.role, id, dto);
  }

  // ── Owner endpoints ─────────────────────────────────────────────

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new court (owner only)' })
  @ApiResponse({ status: 201, description: 'Court created, pending approval' })
  create(@CurrentUser() user: { id: string; role: Role }, @Body() dto: CreateCourtDto) {
    return this.courtsService.create(user.id, dto);
  }

  // ── Admin endpoints ─────────────────────────────────────────────

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve or reject a court (admin only)' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiResponse({ status: 200, description: 'Court status updated' })
  @ApiResponse({ status: 403, description: 'Admin only' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: UpdateCourtStatusDto,
  ) {
    return this.courtsService.updateStatus(id, user.id, dto);
  }
}
