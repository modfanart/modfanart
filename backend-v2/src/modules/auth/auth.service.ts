import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import { AuthToken } from './entities/auth-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  hashPassword,
  comparePassword,
} from '../../common/utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(AuthToken) private authTokenRepo: Repository<AuthToken>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.signup_key !== process.env.SIGNUP_KEY) {
      throw new UnauthorizedException('Invalid signup key');
    }

    const existingEmail = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) throw new ConflictException('Email already in use');

    const existingUsername = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) throw new ConflictException('Username taken');

    const defaultRole = await this.roleRepo.findOne({
      where: { name: 'user' },
    });
    if (!defaultRole) throw new Error('Default role not found');

    const passwordHash = await hashPassword(dto.password);

    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password_hash: passwordHash,
      role_id: defaultRole.id,
      status: 'pending_verification',
    });

    const savedUser = await this.userRepo.save(user);

    // Email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await this.authTokenRepo.save({
      user_id: savedUser.id,
      type: 'email_verification',
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    this.sendVerificationEmail(savedUser, token); // TODO: real email service

    return {
      message: 'User registered. Please verify your email.',
      userId: savedUser.id,
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const authToken = await this.authTokenRepo.findOne({
      where: {
        token_hash: tokenHash,
        type: 'email_verification',
        used_at: null,
        expires_at: new Date(Date.now() + 1000), // still valid
      },
    });

    if (!authToken) throw new BadRequestException('Invalid or expired token');

    await this.userRepo.update(authToken.user_id, {
      email_verified: true,
      status: 'active',
    });
    await this.authTokenRepo.update(authToken.id, { used_at: new Date() });

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['role'],
    });

    if (!user || !user.password_hash)
      throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'active') {
      throw new UnauthorizedException(`Account is ${user.status}`);
    }

    const isMatch = await comparePassword(dto.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // Update last login
    await this.userRepo.update(user.id, { last_login_at: new Date() });

    const accessToken = generateAccessToken(
      { userId: user.id },
      this.jwtService,
    );
    const refreshToken = generateRefreshToken(
      { userId: user.id },
      this.jwtService,
    );

    const refreshHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.refreshTokenRepo.save({
      user_id: user.id,
      token_hash: refreshHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const refreshHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const stored = await this.refreshTokenRepo.findOne({
      where: { token_hash: refreshHash, revoked_at: null },
    });

    if (!stored || stored.expires_at < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const user = await this.userRepo.findOne({ where: { id: payload.userId } });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User inactive');
    }

    return {
      accessToken: generateAccessToken({ userId: user.id }, this.jwtService),
    };
  }

  // forgotPassword, resetPassword, logout methods similarly...
}
