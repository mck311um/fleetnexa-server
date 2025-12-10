import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logStreamName = `${new Date().toISOString().split('T')[0]}-${Date.now()}`;

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),

    new WinstonCloudWatch({
      logGroupName: 'fleetnexa-server-dev',
      logStreamName: logStreamName,
      awsRegion: 'us-east-1',
      jsonMessage: true,
    }),
  ],
};
