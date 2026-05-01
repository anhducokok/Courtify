import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface AuthResult {
  tokens: TokenPair;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    // Check if user exists
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = await this.usersService.create(dto);

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.name, user.role);

    // Save hashed refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return { tokens, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.name, user.role);

    // Save hashed refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return { tokens, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async refresh(userId: string, refreshToken: string): Promise<TokenPair> {
    const user = await this.usersService.findByIdWithRefreshToken(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify hashed refresh token
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.id, user.email, user.name, user.role);

    // Save new hashed refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<AuthUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get user with password field
    const userWithPassword = await this.usersService.findByEmail(user.email);
    if (!userWithPassword) {
      throw new UnauthorizedException('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      userWithPassword.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Update password
    const updatedUser = await this.usersService.updatePassword(
      userId,
      dto.newPassword,
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  }

  private generateTokens(userId: string, email: string, name: string | null, role: string): TokenPair {
    const payload = { id: userId, email, name, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret-key',
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
