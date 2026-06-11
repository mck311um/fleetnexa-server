import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VehicleModelService } from './vehicle-model.service';
import { Roles } from 'src/modules/auth/decorator/role.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Role } from 'src/shared/enums/role.enum';
import {
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
} from './vehicle-model.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { validateExcelColumns } from '../../../utils/excel.utils.js';

@Controller('dashboard/vehicle-model')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
export class VehicleModelController {
  constructor(private readonly service: VehicleModelService) {}

  @Get()
  async getAllVehicleModels() {
    return this.service.getAllVehicleModels();
  }

  @Post()
  async createVehicleModel(@Body() data: CreateVehicleModelDto) {
    return this.service.createVehicleModel(data);
  }

  @Put()
  async updateVehicleModel(@Body() data: UpdateVehicleModelDto) {
    return this.service.updateVehicleModel(data);
  }

  @Post('bulk')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log('Parsed Excel data:', data);

    const { valid, missingColumns } = validateExcelColumns(data, [
      'model',
      'brand',
      'bodyType',
    ]);

    if (!valid) {
      throw new BadRequestException(
        `Missing required columns: ${missingColumns?.join(', ') || 'unknown'}`,
      );
    }

    return this.service.bulkCreateVehicleModels(data);
  }
}
