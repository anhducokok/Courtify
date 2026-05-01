import { Controller, Get } from '@nestjs/common';
import { AppService, Item } from './app.service';
import { Public } from './common/decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('api/items')
  getItems(): Item[] {
    return this.appService.getItems();
  }
}
