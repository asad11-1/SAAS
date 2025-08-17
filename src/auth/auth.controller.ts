// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import * as authService from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: authService.AuthService) {}

  @Post('login')
  async login(@Body() loginDto: authService.LoginDto, @Req() req) {
    // Extract subdomain from request
    const subdomain = this.getSubdomainFromRequest(req);
    console.log('🔍 Login attempt for subdomain:', subdomain); // Debug log
    return this.authService.login(loginDto, subdomain);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return {
      user: req.user,
      tenant: req.tenant,
    };
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Req() req) {
    return {
      valid: true,
      user: req.user,
      tenant: req.tenant,
      subdomain: this.getSubdomainFromRequest(req),
    };
  }

  private getSubdomainFromRequest(req: any): string {
    // ✅ FIXED: Check x-subdomain header first (most reliable)
    const headerSubdomain = req.get('x-subdomain') || req.get('X-Subdomain');
    if (headerSubdomain) {
      console.log('📡 Using subdomain from header:', headerSubdomain);
      return headerSubdomain;
    }

    // Fallback to host-based detection
    const host = req.get('host') || '';
    console.log('🌐 Host:', host);
    
    // Development
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      const fallbackSubdomain = process.env.DEV_SUBDOMAIN || 'vmta';
      console.log('🔧 Development fallback subdomain:', fallbackSubdomain);
      return fallbackSubdomain;
    }

    // Production - extract from hostname
    const parts = host.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      const finalSubdomain = ['www', 'api', 'mail', 'ftp'].includes(subdomain) ? 'admin' : subdomain;
      console.log('🏭 Production subdomain:', finalSubdomain);
      return finalSubdomain;
    }

    console.log('🔄 Default subdomain: admin');
    return 'admin'; // Default to admin for root domain
  }
}