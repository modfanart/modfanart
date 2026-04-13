import { JwtService } from '@nestjs/jwt';

export const generateAccessToken = (payload: any, jwtService: JwtService) =>
  jwtService.sign(payload, { expiresIn: '1d' });

export const generateRefreshToken = (payload: any, jwtService: JwtService) =>
  jwtService.sign(payload, { expiresIn: '7d' });
