import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_MESSAGES } from '../constants/messages.constants';
import { AuthUserRepository } from '../repositories/auth-user.repository';

const AUTH_COOKIE_NAME = 'auth_token';

function extractCookieToken(request: { headers?: { cookie?: string } }) {
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return null;

  const token = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(AUTH_COOKIE_NAME.length + 1);

  if (!token) return null;

  try {
    return decodeURIComponent(token);
  } catch {
    return null;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authUserRepository: AuthUserRepository) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractCookieToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { id: string }) {
    const { id } = payload;

    const user = await this.authUserRepository.findActiveById(id);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_TOKEN);
    }

    if (!user.confirmed) {
      throw new UnauthorizedException(AUTH_MESSAGES.ACCOUNT_NOT_CONFIRMED);
    }

    if (!user.active || user.deletedAt) {
      throw new UnauthorizedException(AUTH_MESSAGES.ACCOUNT_NOT_ACTIVE);
    }

    return user;
  }
}
