import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FieldsModule } from '../fields/fields.module';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';

@Module({
  imports: [DatabaseModule, FieldsModule],
  controllers: [CourtsController],
  providers: [CourtsService],
})
export class CourtsModule {}
