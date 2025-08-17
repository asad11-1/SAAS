import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class ContactService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(tenantId: string, companyId?: string, branchId?: string) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('contacts')
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:companies(id, naam, emailadres, telefoon),
        branch:branches(id, naam_vestiging, emailadres, telefoonnummer)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async findByCompany(companyId: string, tenantId: string) {
    return this.findAll(tenantId, companyId);
  }

  async findByBranch(branchId: string, tenantId: string) {
    return this.findAll(tenantId, undefined, branchId);
  }

  async create(contactData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Validate that either company_id or branch_id is provided, but not both
    if (!contactData.company_id && !contactData.branch_id) {
      throw new Error('Contact must be associated with either a company or branch');
    }
    
    if (contactData.company_id && contactData.branch_id) {
      throw new Error('Contact cannot be associated with both company and branch');
    }

    // If company_id is provided, validate it exists
    if (contactData.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('id', contactData.company_id)
        .eq('tenant_id', tenantId)
        .single();

      if (!company) {
        throw new Error('Company not found');
      }
    }

    // If branch_id is provided, validate it exists
    if (contactData.branch_id) {
      const { data: branch } = await supabase
        .from('branches')
        .select('id')
        .eq('id', contactData.branch_id)
        .eq('tenant_id', tenantId)
        .single();

      if (!branch) {
        throw new Error('Branch not found');
      }
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({ 
        ...contactData, 
        tenant_id: tenantId,
        is_active: contactData.is_active !== undefined ? contactData.is_active : true
      })
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, contactData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Validate contact exists and belongs to tenant
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id, company_id, branch_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!existingContact) {
      throw new Error('Contact not found');
    }

    // If updating company_id or branch_id, validate constraints
    if (contactData.company_id !== undefined || contactData.branch_id !== undefined) {
      const newCompanyId = contactData.company_id !== undefined ? contactData.company_id : existingContact.company_id;
      const newBranchId = contactData.branch_id !== undefined ? contactData.branch_id : existingContact.branch_id;

      if (!newCompanyId && !newBranchId) {
        throw new Error('Contact must be associated with either a company or branch');
      }
      
      if (newCompanyId && newBranchId) {
        throw new Error('Contact cannot be associated with both company and branch');
      }
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ ...contactData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { message: 'Contact deleted successfully' };
  }

  async setPrimary(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Get the contact to determine if it's for a company or branch
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('company_id, branch_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (contactError || !contact) {
      throw new Error('Contact not found');
    }

    // Update this contact to be primary
    const { data, error } = await supabase
      .from('contacts')
      .update({ 
        is_primary: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging)
      `)
      .single();

    if (error) throw error;
    
    // The database trigger should automatically unset other primary contacts,
    // but we can also do it explicitly here for safety
    if (contact.company_id) {
      await supabase
        .from('contacts')
        .update({ is_primary: false })
        .eq('company_id', contact.company_id)
        .eq('tenant_id', tenantId)
        .neq('id', id);
    } else if (contact.branch_id) {
      await supabase
        .from('contacts')
        .update({ is_primary: false })
        .eq('branch_id', contact.branch_id)
        .eq('tenant_id', tenantId)
        .neq('id', id);
    }

    return data;
  }
}