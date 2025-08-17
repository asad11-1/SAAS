// src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../supabase.service';
import { JwtService } from '../../auth/jwt.service';

// ✅ PROPER TYPE DEFINITIONS
interface TenantData {
  id: string;
  subdomain: string;
  company_name: string;
  is_active: boolean;
  plan_type: string;
  max_students: number;
  max_branches: number;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract subdomain from hostname
      const subdomain = this.extractSubdomain(req);
      let tenant: TenantData | null = null; // ✅ FIXED: Proper typing
      let userRole: string | null = null; // ✅ FIXED: Proper typing

      // Get tenant from subdomain (if not admin)
      if (subdomain && subdomain !== 'admin') {
        tenant = await this.getTenantBySubdomain(subdomain);
        if (tenant && tenant.is_active) { // ✅ FIXED: Now has proper type
          req['tenant'] = tenant;
        }
      }

      // Handle authentication if token present
      const token = this.extractTokenFromHeader(req);
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          userRole = payload.role; // ✅ FIXED: Proper assignment

          if (payload.role === 'super_admin') {
            // Super admin can access any subdomain
            req['user'] = { ...payload, role: 'super_admin' };
          } else {
            // Regular user - must match their tenant's subdomain
            if (tenant && payload.tenant_id === tenant.id && payload.subdomain === subdomain) {
              req['user'] = payload;
            }
          }
        } catch (error) {
          // Invalid token - continue without user context
        }
      }

      // Set Supabase RLS context
      if (tenant) {
        await this.supabaseService.setTenantContext(tenant.id); // ✅ FIXED: tenant.id exists
      }
      if (userRole) {
        await this.supabaseService.setUserRole(userRole);
      }

      next();
    } catch (error) {
      console.error('Tenant middleware error:', error);
      next();
    }
  }

  private extractSubdomain(req: Request): string | null {
    const host = req.get('host') || '';
    
    // Development mode
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return process.env.DEV_SUBDOMAIN || 'vmta';
    }

    // Production mode
    const parts = host.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      
      // Skip common non-tenant subdomains
      if (['www', 'api', 'mail', 'ftp'].includes(subdomain)) {
        return null;
      }
      
      return subdomain;
    }

    return null;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getTenantBySubdomain(subdomain: string): Promise<TenantData | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single();

    return error ? null : (data as TenantData);
  }
}