// src/branch/branch.service.ts - Updated to handle converted companies

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface ConvertedBranch {
  id: string;
  naam_vestiging: string;
  original_company_id: string;
  converted_from_company: boolean;
  company?: {
    id: string;
    naam: string;
  };
  conversion_date: string;
  students_count: number;
  contacts_count: number;
}

@Injectable()
export class BranchService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(tenantId: string, companyId?: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('branches')
      .select(`
        *,
        company:companies(id, naam),
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, emailadres, telefoonnummer, mobiel, is_primary, is_active)
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
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, afdeling, emailadres, telefoonnummer, mobiel, notities, is_primary, is_active),
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
        status: branchData.status || 'actief',
        converted_from_company: false // Regular branch creation
      })
      .select(`
        *,
        company:companies(id, naam),
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, emailadres, telefoonnummer, mobiel, is_primary, is_active)
      `)
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
      .select(`
        *,
        company:companies(id, naam),
        contacts(id, voornaam, tussenvoegsel, achternaam, functie, emailadres, telefoonnummer, mobiel, is_primary, is_active)
      `)
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

    // Check if branch has contacts
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('branch_id', id)
      .eq('tenant_id', tenantId);

    if (contacts && contacts.length > 0) {
      throw new Error('Cannot delete branch with linked contacts. Please delete contacts first.');
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

  // NEW: Get branches that were converted from companies
  async getConvertedBranches(tenantId: string, companyId?: string): Promise<ConvertedBranch[]> {
    const supabase = this.supabaseService.getClient();

    try {
      let query = supabase
        .from('branches')
        .select(`
          *,
          company:companies(id, naam)
        `)
        .eq('tenant_id', tenantId)
        .eq('converted_from_company', true)
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data: branches, error } = await query;
      if (error) throw error;

      // Get student and contact counts for each branch
      const enrichedBranches = await Promise.all(
        (branches || []).map(async (branch) => {
          const [studentsResult, contactsResult] = await Promise.all([
            supabase
              .from('students')
              .select('id', { count: 'exact' })
              .eq('branch_id', branch.id)
              .eq('tenant_id', tenantId),
            supabase
              .from('contacts')
              .select('id', { count: 'exact' })
              .eq('branch_id', branch.id)
              .eq('tenant_id', tenantId)
          ]);

          return {
            ...branch,
            conversion_date: branch.created_at,
            students_count: studentsResult.count || 0,
            contacts_count: contactsResult.count || 0
          };
        })
      );

      return enrichedBranches;
    } catch (error) {
      console.error('Error getting converted branches:', error);
      throw new Error('Failed to get converted branches');
    }
  }

  // NEW: Get original company data for a converted branch
  async getOriginalCompanyData(branchId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      // Get the branch with original company ID
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('original_company_id, converted_from_company, created_at')
        .eq('id', branchId)
        .eq('tenant_id', tenantId)
        .eq('converted_from_company', true)
        .single();

      if (branchError || !branch) {
        throw new Error('Branch not found or not converted from company');
      }

      // Get conversion log for additional details
      const { data: conversionLog, error: logError } = await supabase
        .from('system_logs')
        .select('details, created_at')
        .eq('entity_id', branch.original_company_id)
        .eq('tenant_id', tenantId)
        .eq('action', 'CONVERT_COMPANY_TO_BRANCH')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        original_company_id: branch.original_company_id,
        conversion_date: branch.created_at,
        conversion_details: conversionLog?.details || null
      };
    } catch (error) {
      console.error('Error getting original company data:', error);
      throw new Error('Failed to get original company data');
    }
  }

  // NEW: Revert branch back to company (if needed)
  async revertBranchToCompany(branchId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      // First get the branch data
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .eq('tenant_id', tenantId)
        .eq('converted_from_company', true)
        .single();

      if (branchError || !branch) {
        throw new Error('Branch not found or was not converted from a company');
      }

      // Get original company data from conversion log
      const { data: conversionLog } = await supabase
        .from('system_logs')
        .select('details')
        .eq('entity_id', branch.original_company_id)
        .eq('tenant_id', tenantId)
        .eq('action', 'CONVERT_COMPANY_TO_BRANCH')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const originalCompanyData = conversionLog?.details;

      if (!originalCompanyData) {
        throw new Error('Original company data not found in conversion log');
      }

      // This is a complex operation that should be handled by a database function
      // For now, throw an error indicating manual intervention required
      throw new Error('Branch reversion requires manual database operation. Please contact administrator.');
      
    } catch (error) {
      console.error('Error reverting branch to company:', error);
      throw new Error(`Failed to revert branch to company: ${error.message}`);
    }
  }

  // NEW: Get branch statistics including conversion info
  async getBranchStats(tenantId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      const [totalResult, convertedResult, regularResult] = await Promise.all([
        supabase
          .from('branches')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId),
        supabase
          .from('branches')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('converted_from_company', true),
        supabase
          .from('branches')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('converted_from_company', false)
      ]);

      return {
        total_branches: totalResult.count || 0,
        converted_from_companies: convertedResult.count || 0,
        regular_branches: regularResult.count || 0,
        conversion_percentage: totalResult.count 
          ? Math.round(((convertedResult.count || 0) / totalResult.count) * 100)
          : 0
      };
    } catch (error) {
      console.error('Error getting branch stats:', error);
      throw new Error('Failed to get branch statistics');
    }
  }

  // NEW: Find branches that might be good candidates for merging
  async findSimilarBranches(branchId: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      // Get the reference branch
      const { data: referenceBranch, error } = await supabase
        .from('branches')
        .select('naam_vestiging, company_id, plaats, postcode')
        .eq('id', branchId)
        .eq('tenant_id', tenantId)
        .single();

      if (error || !referenceBranch) {
        throw new Error('Reference branch not found');
      }

      // Find similar branches (same company, similar location or name)
      const { data: similarBranches, error: similarError } = await supabase
        .from('branches')
        .select(`
          id, naam_vestiging, straat, huisnummer, postcode, plaats,
          company:companies(id, naam)
        `)
        .eq('tenant_id', tenantId)
        .neq('id', branchId)
        .or(`company_id.eq.${referenceBranch.company_id},plaats.ilike.%${referenceBranch.plaats}%,postcode.ilike.${referenceBranch.postcode}%`)
        .limit(10);

      if (similarError) throw similarError;

      return similarBranches || [];
    } catch (error) {
      console.error('Error finding similar branches:', error);
      throw new Error('Failed to find similar branches');
    }
  }
}