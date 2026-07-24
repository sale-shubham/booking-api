import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AUTH_METHOD_TITLES } from '../../config/configuration';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { SignupTenantDto } from './dto/signup-tenant.dto';
import { LoginEmailDto } from './dto/login-email.dto';

interface JwtPayload {
  sub: string;
  role: UserRole;
  tenantId: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Tenant) private readonly tenants: Repository<Tenant>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  getEnabledMethods() {
    const enabled: string[] = this.config.get('authMethods') ?? ['email_password'];
    return enabled.map((key) => ({ key, title: AUTH_METHOD_TITLES[key] ?? key }));
  }

  async signupTenant(dto: SignupTenantDto) {
    const existing = await this.tenants.findOne({ where: { subdomain: dto.subdomain } });
    if (existing) {
      throw new ConflictException('Subdomain already taken');
    }
    const existingUser = await this.users.findOne({ where: { email: dto.adminEmail } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const tenant = await this.tenants.save(
      this.tenants.create({ name: dto.tenantName, subdomain: dto.subdomain }),
    );

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);
    const admin = await this.users.save(
      this.users.create({
        email: dto.adminEmail,
        passwordHash,
        role: UserRole.CINEMA_ADMIN,
        tenantId: tenant.id,
      }),
    );

    return { tenant, ...this.issueTokens(admin) };
  }

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save(
      this.users.create({
        email: dto.email,
        passwordHash,
        role: UserRole.ATTENDEE,
        tenantId: null,
      }),
    );
    return this.issueTokens(user);
  }

  async loginEmail(dto: LoginEmailDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.issueTokens(user);
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const { passwordHash, otpCode, ...safe } = user;
    return safe;
  }

  private issueTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, role: user.role, tenantId: user.tenantId };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn') as any,
    });
    const refreshToken = this.jwt.sign({ sub: user.id } as Partial<JwtPayload>, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn') as any,
    });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    };
  }
}
