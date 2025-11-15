import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserModule } from '../user.module';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [UserRoleService],
  exports: [UserRoleService],
})
export class UserRoleModule {}
