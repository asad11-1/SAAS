// src/common/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_KEY');
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async setTenantContext(tenantId: string) {
    // Set tenant context for RLS
    try {
      await this.supabase.rpc('set_config', {
        parameter: 'app.current_tenant_id',
        value: tenantId,
      });
    } catch (error) {
      console.warn('Could not set tenant context:', error);
    }
  }

  async setUserRole(role: string) {
    // Set user role context for RLS
    try {
      await this.supabase.rpc('set_config', {
        parameter: 'app.user_role',
        value: role,
      });
    } catch (error) {
      console.warn('Could not set user role:', error);
    }
  }
}
