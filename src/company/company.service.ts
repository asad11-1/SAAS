import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class CompanyService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select('*, branches(*)')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(companyData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('companies')
      .insert({ ...companyData, tenant_id: tenantId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, companyData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { message: 'Company deleted successfully' };
  }
}