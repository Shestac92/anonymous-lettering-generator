import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Throttle } from '@nestjs/throttler';
import { Prompt } from './prompt.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('generate')
  generateImage(@Body() body: Prompt): Promise<string> {
    return this.appService.handlePrompt(body);
  }
}
