import { Module } from '@nestjs/common';
import { StateService } from './state.service.js';
import { StateController } from './state.controller.js';

@Module({
  imports: [],
  controllers: [StateController],
  providers: [StateService],
  exports: [StateService],
})
export class StateModule {}
