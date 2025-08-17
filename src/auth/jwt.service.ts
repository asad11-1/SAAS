// src/auth/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: 'super_admin' | 'tenant_admin' | 'user';
  tenant_id?: string; // null for super admins
  subdomain?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

  sign(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const secret = this.configService.get('JWT_SECRET') || 'your-secret-key';
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }

  verify(token: string): JWTPayload {
    const secret = this.configService.get('JWT_SECRET') || 'your-secret-key';
    return jwt.verify(token, secret) as JWTPayload;
  }

  decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}
