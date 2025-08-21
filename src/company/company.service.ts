// src/company/company.service.ts - Updated with branch conversion functionality

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface ConversionValidationResponse {
  can_convert: boolean;
  errors: string[];
  warnings: string[];
  impact: {
    students_affected: number;
    contacts_affected: number;
    branches_affected: number;
  };
}

export interface ConvertibleCompany {
  id: string;
  naam: string;
  has_branches: boolean;
  has_students: boolean;
  has_contacts: boolean;
  student_count: number;
  contact_count: number;
}

export interface ConversionResult {
  branch_id: string;
  original_company_id: string;
  parent_company_id: string;
  students_transferred: number;
  contacts_transferred: number;
}

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

  // NEW: Get companies that can be converted to branches
  async getConvertibleCompanies(tenantId: string): Promise<ConvertibleCompany[]> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase
        .rpc('get_convertible_companies', { p_tenant_id: tenantId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting convertible companies:', error);
      throw new Error('Failed to get convertible companies');
    }
  }

  // NEW: Validate if conversion is possible
  async validateConversion(
    companyId: string, 
    parentCompanyId: string, 
    tenantId: string
  ): Promise<ConversionValidationResponse> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase
        .rpc('can_convert_company_to_branch', {
          p_company_id: companyId,
          p_parent_company_id: parentCompanyId,
          p_tenant_id: tenantId
        });

      if (error) throw error;

      return data || {
        can_convert: false,
        errors: ['Validation failed'],
        warnings: [],
        impact: {
          students_affected: 0,
          contacts_affected: 0,
          branches_affected: 0
        }
      };
    } catch (error) {
      console.error('Error validating conversion:', error);
      throw new Error('Failed to validate conversion');
    }
  }

  // NEW: Convert company to branch
  async convertToBranch(
    companyId: string, 
    parentCompanyId: string, 
    tenantId: string
  ): Promise<ConversionResult> {
    const supabase = this.supabaseService.getClient();

    try {
      // Get counts before conversion for result
      const [studentsResult, contactsResult] = await Promise.all([
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('company_id', companyId)
          .eq('tenant_id', tenantId),
        supabase
          .from('contacts')
          .select('id', { count: 'exact' })
          .eq('company_id', companyId)
          .eq('tenant_id', tenantId)
      ]);

      const studentsCount = studentsResult.count || 0;
      const contactsCount = contactsResult.count || 0;

      // Execute the conversion
      const { data: branchId, error } = await supabase
        .rpc('convert_company_to_branch', {
          p_company_id: companyId,
          p_parent_company_id: parentCompanyId,
          p_tenant_id: tenantId
        });

      if (error) throw error;

      return {
        branch_id: branchId,
        original_company_id: companyId,
        parent_company_id: parentCompanyId,
        students_transferred: studentsCount,
        contacts_transferred: contactsCount
      };
    } catch (error) {
      console.error('Error converting company to branch:', error);
      throw new Error(`Failed to convert company to branch: ${error.message}`);
    }
  }

  // NEW: Get conversion history for a company/branch
  async getConversionHistory(entityId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('entity_id', entityId)
        .eq('action', 'CONVERT_COMPANY_TO_BRANCH')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversion history:', error);
      throw new Error('Failed to get conversion history');
    }
  }

  // NEW: Get companies that were converted from the given company
  async getConvertedBranches(originalCompanyId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          company:companies(id, naam)
        `)
        .eq('original_company_id', originalCompanyId)
        .eq('tenant_id', tenantId)
        .eq('converted_from_company', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting converted branches:', error);
      throw new Error('Failed to get converted branches');
    }
  }

  // NEW: Get potential parent companies (companies that can accept branches)
  async getPotentialParentCompanies(excludeCompanyId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, naam, status')
        .eq('tenant_id', tenantId)
        .neq('id', excludeCompanyId)
        .eq('status', 'actief')
        .order('naam');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting potential parent companies:', error);
      throw new Error('Failed to get potential parent companies');
    }
  }

  // NEW: Bulk conversion validation (for UI batch operations)
  async validateBulkConversion(
    conversions: Array<{ companyId: string; parentCompanyId: string }>,
    tenantId: string
  ) {
    const results = await Promise.all(
      conversions.map(async ({ companyId, parentCompanyId }) => {
        try {
          const validation = await this.validateConversion(companyId, parentCompanyId, tenantId);
          return {
            companyId,
            parentCompanyId,
            validation
          };
        } catch (error) {
          return {
            companyId,
            parentCompanyId,
            validation: {
              can_convert: false,
              errors: [error.message],
              warnings: [],
              impact: {
                students_affected: 0,
                contacts_affected: 0,
                branches_affected: 0
              }
            }
          };
        }
      })
    );

    return {
      total: results.length,
      valid: results.filter(r => r.validation.can_convert).length,
      invalid: results.filter(r => !r.validation.can_convert).length,
      details: results
    };
  }
}