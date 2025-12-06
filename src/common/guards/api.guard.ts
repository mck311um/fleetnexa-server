import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class ApiGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const apiKey = req.headers['x-api-key'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    if (!apiKey || !signature || !timestamp) {
      throw new UnauthorizedException('Missing auth headers');
    }

    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    const now = Date.now();
    const requestTime = new Date(timestamp).getTime();
    const timeDiff = Math.abs(now - requestTime);

    if (timeDiff > 5 * 60 * 1000) {
      throw new UnauthorizedException('Request expired');
    }

    const payload = `${apiKey}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.API_HMAC_SECRET!)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
