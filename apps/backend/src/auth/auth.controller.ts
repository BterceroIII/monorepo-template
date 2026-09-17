import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from 'src/generated/prisma/client';

const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.authService.getUser(user.id);
  }

  @Post('create-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.createAccount(createAccountDto);
    return { message };
  }

  @Post('confirm-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm user account with token' })
  @ApiResponse({ status: 200, description: 'Account confirmed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async confirmAccount(
    @Body() confirmAccountDto: ConfirmAccountDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.confirmAccount(confirmAccountDto);
    return { message };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, creates an HttpOnly session cookie',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Account not confirmed or not active',
  })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const token = await this.authService.login(loginDto);
    response.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
    return { message: 'Sesión iniciada correctamente' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End current auth session on the client' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Res({ passthrough: true }) response: Response): { message: string } {
    response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.forgotPassword(forgotPasswordDto);
    return { message };
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate password reset token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async validateToken(
    @Body() confirmAccountDto: ConfirmAccountDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.validateToken(confirmAccountDto);
    return { message };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.resetPassword(resetPasswordDto);
    return { message };
  }

  @Patch('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateOwnUser(
    @CurrentUser() user: User,
    @Body() dto: UpdateOwnUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateOwnUser(user.id, dto);
  }
}
