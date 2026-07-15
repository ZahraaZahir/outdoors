import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async healthCheck() {
    const userCount = await this.prisma.user.count();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
      stats: {
        users: userCount,
      },
    };
  }
}
