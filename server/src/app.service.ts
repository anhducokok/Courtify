import { Injectable } from '@nestjs/common';

export interface Item {
  id: number;
  name: string;
  description: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getItems(): Item[] {
    return [
      { id: 1, name: 'Item A', description: 'Description for item A' },
      { id: 2, name: 'Item B', description: 'Description for item B' },
      { id: 3, name: 'Item C', description: 'Description for item C' },
    ];
  }
}
