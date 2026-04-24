import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CourtsController],
  providers: [CourtsService],
})
export class CourtsModule {}
