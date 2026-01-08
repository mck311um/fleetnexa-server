import { Controller, Get, Head, Res } from '@nestjs/common';
import { HealthService } from './health.service.js';
import type { Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async getHealth(@Res() res: Response) {
    const health = await this.healthService.checkHealth();

    if (health.status === 'healthy') {
      return res.status(200).json(health);
    }

    return res.status(500).json(health);
  }

  @Head()
  async headHealth(@Res() res: Response) {
    const health = await this.healthService.checkHealth();
    return res.sendStatus(health.status === 'healthy' ? 200 : 500);
  }
}
