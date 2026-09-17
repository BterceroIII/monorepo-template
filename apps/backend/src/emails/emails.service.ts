import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailUser } from './interfaces/email-user.interface';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  constructor(private readonly configService: ConfigService) {}

  sendConfirmationEmail(user: EmailUser): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.logger.log(
      `[EMAIL] Confirmation for ${user.email}: ${frontendUrl}/auth/confirm-account (token ${user.token})`,
    );
    return Promise.resolve();
  }

  sendPasswordResetToken(user: EmailUser): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.logger.log(
      `[EMAIL] Password reset for ${user.email}: ${frontendUrl}/auth/new-password (token ${user.token})`,
    );
    return Promise.resolve();
  }
}
