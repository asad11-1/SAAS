import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class BranchService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(tenantId: string, companyId?: string) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('branches')
      .select(`
        *,
        company:companies(id, naam)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('branches')
      .select(`
        *,
        company:companies(id, naam, emailadres, telefoon),
        students(id, voornaam, achternaam, emailadres, is_active)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(branchData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Validate company exists
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', branchData.company_id)
      .eq('tenant_id', tenantId)
      .single();

    if (!company) {
      throw new Error('Company not found');
    }

    const { data, error } = await supabase
      .from('branches')
      .insert({ 
        ...branchData, 
        tenant_id: tenantId,
        status: branchData.status || 'actief'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, branchData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('branches')
      .update({ ...branchData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Check if branch has students
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('branch_id', id)
      .eq('tenant_id', tenantId);

    if (students && students.length > 0) {
      throw new Error('Cannot delete branch with linked students');
    }

    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { message: 'Branch deleted successfully' };
  }

  async findByCompany(companyId: string, tenantId: string) {
    return this.findAll(tenantId, companyId);
  }
}