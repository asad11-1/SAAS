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
        branch:branches(id, naam_vestiging),
        contact:contacts(id, is_primary, is_active)
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
    if (filters?.is_contact !== undefined) {
      query = query.eq('is_contact', filters.is_contact);
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
        branch:branches(id, naam_vestiging, company_id),
        contact:contacts(id, functie, afdeling, emailadres, telefoonnummer, mobiel, notities, is_primary, is_active)
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

    // Create student
    const { data, error } = await supabase
      .from('students')
      .insert({ 
        ...studentData, 
        tenant_id: tenantId,
        is_active: studentData.is_active !== undefined ? studentData.is_active : true,
        is_contact: studentData.is_contact || false
      })
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging)
      `)
      .single();

    if (error) throw error;

    // If student should be a contact, the trigger will handle creating the contact record
    // We can also manually create it here if needed
    if (studentData.is_contact) {
      try {
        await supabase
          .from('contacts')
          .insert({
            tenant_id: tenantId,
            student_id: data.id,
            voornaam: data.voornaam,
            tussenvoegsel: data.tussenvoegsel,
            achternaam: data.achternaam,
            emailadres: data.emailadres,
            telefoonnummer: data.telefoonnummer,
            functie: data.functie,
            afdeling: data.afdeling,
            company_id: data.company_id,
            branch_id: data.branch_id,
            is_active: data.is_active,
            is_primary: studentData.is_primary_contact || false
          });
      } catch (contactError) {
        console.warn('Contact creation failed, but student was created:', contactError);
      }
    }

    return data;
  }

  async update(id: string, studentData: any, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Get existing student data
    const { data: existingStudent } = await supabase
      .from('students')
      .select('is_contact, company_id, branch_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!existingStudent) {
      throw new Error('Student not found');
    }

    // Validate relationships if they're being changed
    if (studentData.company_id || studentData.branch_id) {
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
        const companyId = studentData.company_id || existingStudent.company_id;
        if (companyId && branch.company_id !== companyId) {
          throw new Error('Branch does not belong to selected company');
        }
      }
    }

    // Update student
    const { data, error } = await supabase
      .from('students')
      .update({ ...studentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging),
        contact:contacts(id, is_primary, is_active)
      `)
      .single();

    if (error) throw error;

    // Handle contact status changes
    if (studentData.is_contact !== undefined && studentData.is_contact !== existingStudent.is_contact) {
      if (studentData.is_contact) {
        // Student is becoming a contact - create contact record if it doesn't exist
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .eq('student_id', id)
          .eq('tenant_id', tenantId)
          .single();

        if (!existingContact) {
          await supabase
            .from('contacts')
            .insert({
              tenant_id: tenantId,
              student_id: id,
              voornaam: data.voornaam,
              tussenvoegsel: data.tussenvoegsel,
              achternaam: data.achternaam,
              emailadres: data.emailadres,
              telefoonnummer: data.telefoonnummer,
              functie: data.functie,
              afdeling: data.afdeling,
              company_id: data.company_id,
              branch_id: data.branch_id,
              is_active: data.is_active,
              is_primary: studentData.is_primary_contact || false
            });
        } else {
          // Reactivate existing contact
          await supabase
            .from('contacts')
            .update({ is_active: true, updated_at: new Date().toISOString() })
            .eq('student_id', id)
            .eq('tenant_id', tenantId);
        }
      } else {
        // Student is no longer a contact - deactivate contact record
        await supabase
          .from('contacts')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('student_id', id)
          .eq('tenant_id', tenantId);
      }
    }

    return data;
  }

  async remove(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Check if student has a contact record
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('student_id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (contact) {
      // Delete the contact record first
      await supabase
        .from('contacts')
        .delete()
        .eq('student_id', id)
        .eq('tenant_id', tenantId);
    }

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
      .select('id, is_active, is_contact, created_at')
      .eq('tenant_id', tenantId);

    const total = students?.length || 0;
    const active = students?.filter(s => s.is_active)?.length || 0;
    const contacts = students?.filter(s => s.is_contact)?.length || 0;
    const thisMonth = students?.filter(s => {
      const created = new Date(s.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    })?.length || 0;

    return { total, active, contacts, thisMonth };
  }

  // New method to toggle contact status
  async toggleContactStatus(id: string, tenantId: string, isContact: boolean) {
    return this.update(id, { is_contact: isContact }, tenantId);
  }

  // New method to get students who are contacts
  async findStudentContacts(tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging),
        contact:contacts(id, is_primary, is_active, notities)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_contact', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // New method to promote student to primary contact
  async setAsPrimaryContact(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // First make sure student is marked as contact
    await this.update(id, { is_contact: true }, tenantId);
    
    // Get the contact record
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('student_id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (contact) {
      // Set as primary contact
      await supabase
        .from('contacts')
        .update({ is_primary: true, updated_at: new Date().toISOString() })
        .eq('id', contact.id)
        .eq('tenant_id', tenantId);
    }

    return this.findOne(id, tenantId);
  }
}