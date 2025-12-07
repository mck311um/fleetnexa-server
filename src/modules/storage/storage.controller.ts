import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { UploadFileDto } from './dto/upload-file.dto.js';
import { ApiGuard } from '../../common/guards/api.guard.js';

@Controller('storage')
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  async uploadFile(
    @Body() data: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadFile(data, file);
  }

  @Post('storefront')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(ApiGuard)
  async uploadStorefrontFile(
    @Body() data: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadFile(data, file);
  }
}
