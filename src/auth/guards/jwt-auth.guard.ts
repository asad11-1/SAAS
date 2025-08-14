// src/auth/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtService } from '../jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      
      // Additional subdomain validation for security
      if (payload.role !== 'super_admin') {
        const currentSubdomain = this.extractSubdomain(request);
        
        // Ensure user's token subdomain matches current subdomain
        if (payload.subdomain !== currentSubdomain) {
          throw new UnauthorizedException('Token not valid for this subdomain');
        }
      }

      const user = await this.authService.validateToken(token);
      request.user = user;
      request.tokenPayload = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token: ' + error.message);
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractSubdomain(request: any): string {
    const host = request.get('host') || '';
    
    if (host.includes('localhost')) {
      return process.env.DEV_SUBDOMAIN || 'vmta';
    }

    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    
    return 'admin';
  }
}