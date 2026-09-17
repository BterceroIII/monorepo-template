import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constants';
import {
  checkPassword,
  generateJWT,
  generateToken,
  hashPassword,
} from 'src/common/utils';
import { CreateAccountDto } from './dto/create-account.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';
import { EmailsService } from 'src/emails/emails.service';
import { AuthRepository, UserProfile } from './repositories/auth.repository';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getErrorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly repo: AuthRepository,
    private readonly emailService: EmailsService,
  ) {}

  async createAccount(createAccountDto: CreateAccountDto): Promise<string> {
    const { email, password, name } = createAccountDto;

    try {
      const userExists = await this.repo.findByEmail(email);

      if (userExists) {
        this.logger.error(`User already exists: ${email}`);
        throw new ConflictException(AUTH_MESSAGES.EMAIL_EXISTS);
      }

      const user = await this.repo.create({
        name,
        email,
        password: await hashPassword(password),
        token: generateToken(),
        confirmed: false,
      });

      this.logger.log(`New user registered: ${email}`);

      await this.emailService.sendConfirmationEmail({
        name: user.name ?? email,
        email: user.email,
        token: user.token ?? '',
      });

      return AUTH_MESSAGES.ACCOUNT_CREATED;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Error creating account: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw new InternalServerErrorException(AUTH_MESSAGES.GENERIC_ERROR);
    }
  }

  async confirmAccount(confirmAccountDto: ConfirmAccountDto): Promise<string> {
    const { token } = confirmAccountDto;

    try {
      const user = await this.repo.findByToken(token);

      if (!user || user.deletedAt) {
        this.logger.error(
          `Account confirmation attempt with invalid token: ${token}`,
        );
        throw new UnauthorizedException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      await this.repo.confirmAccount(user.id);

      this.logger.log(`Account confirmed for user: ${user.email}`);

      return AUTH_MESSAGES.ACCOUNT_CONFIRMED;
    } catch (error) {
      this.logger.error(
        `Error confirming account: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;

    try {
      const user = await this.repo.findByEmail(email);

      if (!user || user.deletedAt) {
        this.logger.error(`Login attempt with non-existent email: ${email}`);
        throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.confirmed) {
        this.logger.error(`Login attempt with unconfirmed account: ${email}`);
        throw new ForbiddenException(AUTH_MESSAGES.ACCOUNT_NOT_CONFIRMED);
      }

      if (!user.active) {
        this.logger.error(`Login attempt with inactive account: ${email}`);
        throw new ForbiddenException(AUTH_MESSAGES.ACCOUNT_NOT_ACTIVE);
      }

      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        this.logger.error(`Failed login attempt for user: ${email}`);
        throw new UnauthorizedException(AUTH_MESSAGES.INCORRECT_PASSWORD);
      }

      const token = generateJWT(user.id);
      this.logger.log(`Successful login for user: ${email}`);
      return token;
    } catch (error) {
      this.logger.error(
        `Error during login: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const { email } = forgotPasswordDto;

    try {
      const user = await this.repo.findByEmail(email);

      if (!user || user.deletedAt) {
        this.logger.error(
          `Password reset attempt for non-existent email: ${email}`,
        );
        throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const userToken = generateToken();
      await this.repo.updateResetToken(user.id, userToken);
      this.logger.log(`Password reset token generated for user: ${email}`);

      await this.emailService.sendPasswordResetToken({
        name: user.name ?? email,
        email: user.email,
        token: userToken,
      });

      return AUTH_MESSAGES.CHECK_EMAIL;
    } catch (error) {
      this.logger.error(
        `Error in forgot password process: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async validateToken(confirmAccountDto: ConfirmAccountDto): Promise<string> {
    const { token } = confirmAccountDto;

    try {
      const tokenExists = await this.repo.findByToken(token);

      if (!tokenExists) {
        this.logger.error(
          `Token validation attempt with invalid token: ${token}`,
        );
        throw new NotFoundException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      this.logger.log('Token validated successfully');
      return AUTH_MESSAGES.TOKEN_VALID;
    } catch (error) {
      this.logger.error(
        `Error validating token: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { token, password } = resetPasswordDto;

    try {
      const user = await this.repo.findByToken(token);
      if (!user) {
        this.logger.error(
          `Password reset attempt with invalid token: ${token}`,
        );
        throw new NotFoundException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      await this.repo.updatePasswordAndClearToken(
        user.id,
        await hashPassword(password),
      );
      this.logger.log(`Password reset successful for user: ${user.email}`);

      return AUTH_MESSAGES.PASSWORD_CHANGED;
    } catch (error) {
      this.logger.error(
        `Error resetting password: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserProfile> {
    try {
      const user = await this.repo.findProfileById(userId);

      if (!user) {
        this.logger.warn(`User fetch attempt with invalid ID: ${userId}`);
        throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error fetching user: ${getErrorMessage(error)}`,
        getErrorStack(error),
      );
      throw error;
    }
  }

  async updateOwnUser(
    userId: string,
    dto: UpdateOwnUserDto,
  ): Promise<UserProfile> {
    return this.repo.updateProfile(userId, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
    });
  }
}
