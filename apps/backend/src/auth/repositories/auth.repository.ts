import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserProfile = Prisma.UserGetPayload<{
  select: typeof userProfileSelect;
}>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByToken(token: string) {
    return this.prisma.user.findUnique({ where: { token } });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async confirmAccount(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { confirmed: true, token: null },
    });
  }

  async updateResetToken(id: string, token: string) {
    return this.prisma.user.update({ where: { id }, data: { token } });
  }

  async updatePasswordAndClearToken(id: string, password: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password, token: null },
    });
  }

  async findProfileById(id: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userProfileSelect,
    });
  }

  async updateProfile(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userProfileSelect,
    });
  }
}
