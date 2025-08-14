import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class StudentService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(tenantId: string, filters?: any) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('students')
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }
    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.search) {
      query = query.or(`voornaam.ilike.%${filters.search}%,achternaam.ilike.%${filters.search}%,emailadres.ilike.%${filters.search}%,bsn_nummer.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        company:companies(id, naam, emailadres, telefoon),
        branch:branches(id, naam_vestiging, company_id)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(studentData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Validate relationships
    if (studentData.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('id', studentData.company_id)
        .eq('tenant_id', tenantId)
        .single();

      if (!company) {
        throw new Error('Company not found');
      }
    }

    if (studentData.branch_id) {
      const { data: branch } = await supabase
        .from('branches')
        .select('id, company_id')
        .eq('id', studentData.branch_id)
        .eq('tenant_id', tenantId)
        .single();

      if (!branch) {
        throw new Error('Branch not found');
      }

      // Validate branch belongs to company
      if (studentData.company_id && branch.company_id !== studentData.company_id) {
        throw new Error('Branch does not belong to selected company');
      }
    }

    const { data, error } = await supabase
      .from('students')
      .insert({ 
        ...studentData, 
        tenant_id: tenantId,
        is_active: studentData.is_active !== undefined ? studentData.is_active : true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, studentData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Same validation as create for relationships
    if (studentData.company_id || studentData.branch_id) {
      // Add validation logic here
    }

    const { data, error } = await supabase
      .from('students')
      .update({ ...studentData, updated_at: new Date().toISOString() })
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
      .from('students')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { message: 'Student deleted successfully' };
  }

  async getStats(tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data: students } = await supabase
      .from('students')
      .select('id, is_active, created_at')
      .eq('tenant_id', tenantId);

    const total = students?.length || 0;
    const active = students?.filter(s => s.is_active)?.length || 0;
    const thisMonth = students?.filter(s => {
      const created = new Date(s.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    })?.length || 0;

    return { total, active, thisMonth };
  }
}