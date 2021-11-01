import { Injectable } from '@nestjs/common';
import { Message } from '@nx-stack/api-interfaces';

@Injectable()
export class AppService {
  getData(): Message {
    return { message: 'Welcome to api updated!' };
  }
}
