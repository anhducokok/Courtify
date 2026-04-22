import { Controller, Get } from '@nestjs/common';
import { AppService, Item } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/items')
  getItems(): Item[] {
    return this.appService.getItems();
  }
}
