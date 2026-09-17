import { Module } from '@nestjs/common';
import { AuthUserRepository } from './repositories/auth-user.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuthUserRepository],
  exports: [AuthUserRepository],
})
export class CommonModule {}
