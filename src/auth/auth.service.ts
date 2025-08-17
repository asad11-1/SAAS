// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
  };
  tenant?: {
    id: string;
    subdomain: string;
    company_name: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, subdomain: string): Promise<AuthResponse> {
    const { email, password } = loginDto;

    console.log(`🔐 Login attempt - Email: ${email}, Subdomain: ${subdomain}`);

    // Admin subdomain = super admin login
    if (subdomain === 'admin') {
      console.log('👑 Attempting super admin login');
      return this.loginSuperAdmin(email, password);
    }

    // Any other subdomain = tenant user login
    if (!subdomain) {
      throw new BadRequestException('Invalid subdomain');
    }

    console.log(`🏢 Attempting tenant user login for: ${subdomain}`);
    return this.loginTenantUser(email, password, subdomain);
  }

  private async loginSuperAdmin(email: string, password: string): Promise<AuthResponse> {
    const supabase = this.supabaseService.getClient();

    console.log(`🔍 Looking for super admin with email: ${email}`);

    const { data: admin, error } = await supabase
      .from('super_admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Super admin query error:', error);
      throw new UnauthorizedException('Invalid super admin credentials');
    }

    if (!admin) {
      console.log('❌ No super admin found with this email');
      throw new UnauthorizedException('Invalid super admin credentials');
    }

    console.log('✅ Super admin found, checking password');

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for super admin');
      throw new UnauthorizedException('Invalid super admin credentials');
    }

    console.log('✅ Super admin login successful');

    // Update last login
    await supabase
      .from('super_admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: 'super_admin',
    });

    return {
      access_token: token,
      user: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: 'super_admin',
      },
    };
  }

  private async loginTenantUser(email: string, password: string, subdomain: string): Promise<AuthResponse> {
    const supabase = this.supabaseService.getClient();

    console.log(`🔍 Looking for tenant with subdomain: ${subdomain}`);

    // Get tenant from subdomain
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single();

    if (tenantError) {
      console.error('❌ Tenant query error:', tenantError);
      throw new UnauthorizedException(`Invalid tenant: ${subdomain}`);
    }

    if (!tenant) {
      console.log(`❌ No active tenant found for subdomain: ${subdomain}`);
      throw new UnauthorizedException(`Invalid tenant: ${subdomain}`);
    }

    console.log(`✅ Tenant found: ${tenant.company_name}, looking for user`);

    // Get user for this tenant
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .single();

    if (userError) {
      console.error('❌ User query error:', userError);
      throw new UnauthorizedException(`Invalid credentials for ${subdomain}`);
    }

    if (!user) {
      console.log(`❌ No active user found with email ${email} for tenant ${subdomain}`);
      throw new UnauthorizedException(`Invalid credentials for ${subdomain}`);
    }

    console.log('✅ User found, checking password');

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for tenant user');
      throw new UnauthorizedException(`Invalid credentials for ${subdomain}`);
    }

    console.log('✅ Tenant user login successful');

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: tenant.id,
      subdomain: tenant.subdomain,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        company_name: tenant.company_name,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.role === 'super_admin') {
        return this.validateSuperAdmin(payload.sub);
      } else {
        // ✅ FIXED: Add proper null check and type guard
        if (!payload.tenant_id) {
          throw new UnauthorizedException('Invalid token: missing tenant_id');
        }
        return this.validateTenantUser(payload.sub, payload.tenant_id);
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async validateSuperAdmin(adminId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('super_admins')
      .select('id, email, first_name, last_name')
      .eq('id', adminId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new UnauthorizedException('Super admin not found');
    }

    return { ...data, role: 'super_admin' };
  }

  private async validateTenantUser(userId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, tenant_id')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new UnauthorizedException('User not found');
    }

    return data;
  }
}