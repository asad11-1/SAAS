import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class CompanyService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, emailadres, telefoonnummer, mobiel, is_primary, is_active),
        branches(id, naam_vestiging, status)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, afdeling, emailadres, telefoonnummer, mobiel, notities, is_primary, is_active),
        branches(id, naam_vestiging, straat, huisnummer, postcode, plaats, status)
      `)
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
      .insert({ 
        ...companyData, 
        tenant_id: tenantId,
        status: companyData.status || 'actief'
      })
      .select(`
        *,
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, emailadres, telefoonnummer, mobiel, is_primary, is_active),
        branches(id, naam_vestiging, status)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, companyData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('companies')
      .update({ ...companyData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, emailadres, telefoonnummer, mobiel, is_primary, is_active),
        branches(id, naam_vestiging, status)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Check if company has students
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('company_id', id)
      .eq('tenant_id', tenantId);

    if (students && students.length > 0) {
      throw new Error('Cannot delete company with linked students');
    }

    // Check if company has branches
    const { data: branches } = await supabase
      .from('branches')
      .select('id')
      .eq('company_id', id)
      .eq('tenant_id', tenantId);

    if (branches && branches.length > 0) {
      throw new Error('Cannot delete company with linked branches. Please delete branches first.');
    }

    // Check if company has contacts
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('company_id', id)
      .eq('tenant_id', tenantId);

    if (contacts && contacts.length > 0) {
      throw new Error('Cannot delete company with linked contacts. Please delete contacts first.');
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { message: 'Company deleted successfully' };
  }
}