import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StateService } from './state.service.js';
import { StateDto } from './state.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { validateExcelColumns } from '../../../utils/excel.utils.js';

@Controller('dashboard/state')
export class StateController {
  constructor(private readonly service: StateService) {}

  @Get()
  async getStates() {
    return this.service.getStates();
  }

  @Get('api')
  async getStatesFromApi() {
    return this.service.getStatesFromApi();
  }

  @Post()
  async createState(@Body() data: StateDto) {
    return this.service.createState(data);
  }

  @Put()
  async updateState(@Body() data: StateDto) {
    return this.service.updateState(data);
  }

  @Delete(':id')
  async deleteState(@Param('id') id: string) {
    return this.service.deleteState(id);
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

    const { valid, missingColumns } = validateExcelColumns(data, [
      'state',
      'country',
    ]);
    if (!valid) {
      throw new BadRequestException(
        `Missing required columns: ${missingColumns?.join(', ') || 'unknown'}`,
      );
    }

    return this.service.bulkCreateStates(data);
  }
}
