import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'dev-secret-key',
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
  },
});

export const getJwtRefreshConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
  signOptions: {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  },
});
