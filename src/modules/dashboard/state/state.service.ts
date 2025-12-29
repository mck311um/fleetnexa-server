/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { StateDto } from './state.dto.js';
import { FormatterService } from '../../../common/formatter/formatter.service.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Country } from 'src/generated/prisma/client.js';

@Injectable()
export class StateService {
  private readonly logger = new Logger(StateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly formatter: FormatterService,
  ) {}

  async getStates() {
    try {
      return this.prisma.state.findMany({
        include: {
          country: true,
          _count: {
            select: {
              villages: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error fetching states', error);
      throw error;
    }
  }

  async createState(data: StateDto) {
    try {
      let country: Country | null = null;

      if (data.countryId) {
        country = await this.prisma.country.findUnique({
          where: { id: data.countryId },
        });
      } else {
        country = await this.prisma.country.findFirst({
          where: {
            country: { equals: data.country, mode: 'insensitive' },
          },
        });
      }

      if (!country) {
        this.logger.warn(`Country with ID ${data.countryId} not found`);
        throw new NotFoundException('Country not found');
      }

      const existing = await this.prisma.state.findFirst({
        where: {
          state: { equals: data.state, mode: 'insensitive' },
          countryId: country.id,
        },
      });

      if (existing) {
        this.logger.warn(
          `State ${data.state} already exists in country ID ${data.countryId}`,
        );
        throw new ConflictException('State already exists');
      }

      const state = await this.formatter.formatToTitleCase(data.state);

      await this.prisma.state.create({
        data: {
          state,
          countryId: country.id,
        },
      });

      const states = await this.getStates();

      return {
        message: 'State created successfully',
        states,
      };
    } catch (error) {
      this.logger.error('Error creating state', error);
      throw error;
    }
  }

  async bulkCreateStates(data: any[]) {
    try {
      const failedRows: { item: any; errors?: any; error?: string }[] = [];

      for (const item of data) {
        const instance: StateDto = plainToInstance(StateDto, item);
        const errors = await validate(instance);

        if (errors.length > 0) {
          failedRows.push({ item, errors });
          this.logger.warn(
            `Validation failed for country: ${JSON.stringify(item)}`,
          );
          continue;
        }

        try {
          await this.createState(instance);
        } catch (error) {
          failedRows.push({ item, error: error.message });
          this.logger.warn(
            `Skipping country due to error: ${JSON.stringify(item)} - Error: ${error.message}`,
          );
        }
      }

      const states = await this.getStates();

      return {
        message: 'Bulk state upload completed',
        states,
      };
    } catch (error) {
      this.logger.error('Error during bulk state upload', error);
      throw error;
    }
  }

  async updateState(data: StateDto) {
    try {
      const existing = await this.prisma.state.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        this.logger.warn(`State with ID ${data.id} not found`);
        throw new NotFoundException('State not found');
      }

      let countryId = existing.countryId;

      if (data.countryId) {
        const country = await this.prisma.country.findUnique({
          where: { id: data.countryId },
        });

        if (!country) {
          this.logger.warn(`Country with ID ${data.countryId} not found`);
          throw new NotFoundException('Country not found');
        }

        countryId = country.id;
      }

      const state = await this.formatter.formatToTitleCase(data.state);

      await this.prisma.state.update({
        where: { id: data.id },
        data: {
          state,
          countryId,
        },
      });

      const states = await this.getStates();

      return {
        message: 'State updated successfully',
        states,
      };
    } catch (error) {
      this.logger.error('Error updating state', error);
      throw error;
    }
  }

  async deleteState(id: string) {
    try {
      const existing = await this.prisma.state.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              villages: true,
              addresses: true,
              customerAddresses: true,
              presetLocations: true,
              storefrontUser: true,
            },
          },
        },
      });

      if (!existing) {
        this.logger.warn(`State with ID ${id} not found`);
        throw new NotFoundException('State not found');
      }

      if (
        existing._count.villages > 0 ||
        existing._count.addresses > 0 ||
        existing._count.customerAddresses > 0 ||
        existing._count.presetLocations > 0 ||
        existing._count.storefrontUser > 0
      ) {
        this.logger.warn(
          `Cannot delete state with ID ${id} because it has associated data`,
        );
        throw new ConflictException(
          'Cannot delete state with associated villages',
        );
      }

      await this.prisma.state.delete({
        where: { id },
      });

      const states = await this.getStates();

      return {
        message: 'State deleted successfully',
        states,
      };
    } catch (error) {
      this.logger.error('Error deleting state', error);
      throw error;
    }
  }
}
