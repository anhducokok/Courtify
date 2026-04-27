import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
import { CourtsService } from './courts.service';
import { QueryCourtsDto } from './dto/query-courts.dto';
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

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single court by ID (includes fields)' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiResponse({ status: 200, description: 'Court object with fields' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  // ── Nested field routes ──────────────────────────────────────

  @Get(':id/fields')
  @Public()
  @ApiOperation({ summary: 'List all fields belonging to a court' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiResponse({ status: 200, description: 'Array of field objects' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  findFields(@Param('id') id: string) {
    return this.fieldsService.findByCourtId(id);
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
}
