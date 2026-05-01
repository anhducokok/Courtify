import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(input.password, 12);
    return this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findByIdWithRefreshToken(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        refreshToken: true,
        createdAt: true,
      },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const hashedToken = refreshToken
      ? await bcrypt.hash(refreshToken, 12)
      : null;

    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
