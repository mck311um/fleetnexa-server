import { Module } from '@nestjs/common';
import { UserModule } from '../user.module.js';
import { UserRoleService } from './user-role.service.js';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [UserRoleService],
  exports: [UserRoleService],
})
export class UserRoleModule {}
