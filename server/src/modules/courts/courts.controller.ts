import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { CourtsService } from './courts.service';
import { QueryCourtsDto } from './dto/query-courts.dto';

@ApiTags('courts')
@Public()
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  @ApiOperation({ summary: 'List courts with optional filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of courts' })
  findAll(@Query() query: QueryCourtsDto) {
    return this.courtsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single court by ID' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiResponse({ status: 200, description: 'Court object' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get available time slots for a court on a given date' })
  @ApiParam({ name: 'id', description: 'Court UUID' })
  @ApiQuery({ name: 'date', required: true, description: 'ISO date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Array of available TimeSlot objects' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  findAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.courtsService.findAvailability(id, date);
  }
}
