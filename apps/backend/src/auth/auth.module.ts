import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { EmailsModule } from 'src/emails/emails.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [PrismaModule, EmailsModule, CommonModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
