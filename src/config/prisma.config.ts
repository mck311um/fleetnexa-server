import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import logger from './logger.config';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('error', (e) => {
  logger.logger.error(`Prisma Error: ${e.message}`, { target: e.target });
});

prisma.$on('warn', (e) => {
  logger.logger.warn(`Prisma Warning: ${e.message}`, { target: e.target });
});

export default prisma;

export type TxClient = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
