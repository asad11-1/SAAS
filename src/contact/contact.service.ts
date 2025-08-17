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
        branch:branches(id, naam_vestiging),
        student:students(id, voornaam, tussenvoegsel, achternaam, personeelsnummer, is_active)
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
        branch:branches(id, naam_vestiging, emailadres, telefoonnummer),
        student:students(id, voornaam, tussenvoegsel, achternaam, personeelsnummer, emailadres, telefoonnummer, functie, afdeling, is_active)
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
    
    // If creating contact from student
    if (contactData.student_id) {
      // Validate student exists and belongs to tenant
      const { data: student } = await supabase
        .from('students')
        .select('id, voornaam, tussenvoegsel, achternaam, emailadres, telefoonnummer, functie, afdeling, company_id, branch_id')
        .eq('id', contactData.student_id)
        .eq('tenant_id', tenantId)
        .single();

      if (!student) {
        throw new Error('Student not found');
      }

      // Check if student already has a contact record
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('student_id', contactData.student_id)
        .eq('tenant_id', tenantId)
        .single();

      if (existingContact) {
        throw new Error('Student already has a contact record');
      }

      // Auto-fill contact data from student if not provided
      contactData = {
        ...contactData,
        voornaam: contactData.voornaam || student.voornaam,
        tussenvoegsel: contactData.tussenvoegsel || student.tussenvoegsel,
        achternaam: contactData.achternaam || student.achternaam,
        emailadres: contactData.emailadres || student.emailadres,
        telefoonnummer: contactData.telefoonnummer || student.telefoonnummer,
        functie: contactData.functie || student.functie,
        afdeling: contactData.afdeling || student.afdeling,
        company_id: contactData.company_id || student.company_id,
        branch_id: contactData.branch_id || student.branch_id,
      };

      // Mark student as contact
      await supabase
        .from('students')
        .update({ is_contact: true })
        .eq('id', contactData.student_id)
        .eq('tenant_id', tenantId);
    } else {
      // Regular contact validation (not from student)
      if (!contactData.company_id && !contactData.branch_id) {
        throw new Error('Contact must be associated with either a company or branch');
      }
      
      if (contactData.company_id && contactData.branch_id) {
        throw new Error('Contact cannot be associated with both company and branch');
      }

      // Validate company if provided
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

      // Validate branch if provided
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
        branch:branches(id, naam_vestiging),
        student:students(id, voornaam, tussenvoegsel, achternaam, personeelsnummer, is_active)
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
      .select('id, company_id, branch_id, student_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (!existingContact) {
      throw new Error('Contact not found');
    }

    // If this is a student-linked contact, sync updates to student
    if (existingContact.student_id) {
      const studentUpdateData: any = {};
      
      if (contactData.voornaam !== undefined) studentUpdateData.voornaam = contactData.voornaam;
      if (contactData.tussenvoegsel !== undefined) studentUpdateData.tussenvoegsel = contactData.tussenvoegsel;
      if (contactData.achternaam !== undefined) studentUpdateData.achternaam = contactData.achternaam;
      if (contactData.emailadres !== undefined) studentUpdateData.emailadres = contactData.emailadres;
      if (contactData.telefoonnummer !== undefined) studentUpdateData.telefoonnummer = contactData.telefoonnummer;
      if (contactData.functie !== undefined) studentUpdateData.functie = contactData.functie;
      if (contactData.afdeling !== undefined) studentUpdateData.afdeling = contactData.afdeling;

      if (Object.keys(studentUpdateData).length > 0) {
        await supabase
          .from('students')
          .update({ ...studentUpdateData, updated_at: new Date().toISOString() })
          .eq('id', existingContact.student_id)
          .eq('tenant_id', tenantId);
      }
    } else {
      // Regular contact validation for non-student contacts
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
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ ...contactData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging),
        student:students(id, voornaam, tussenvoegsel, achternaam, personeelsnummer, is_active)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Check if this contact is linked to a student
    const { data: contact } = await supabase
      .from('contacts')
      .select('student_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (contact?.student_id) {
      // Unmark student as contact
      await supabase
        .from('students')
        .update({ is_contact: false })
        .eq('id', contact.student_id)
        .eq('tenant_id', tenantId);
    }

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
        branch:branches(id, naam_vestiging),
        student:students(id, voornaam, tussenvoegsel, achternaam, personeelsnummer, is_active)
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

  // New method to create contact from student
  async createFromStudent(studentId: string, tenantId: string, additionalData?: any) {
    const contactData = {
      student_id: studentId,
      ...additionalData
    };
    
    return this.create(contactData, tenantId);
  }

  // New method to get contacts that are linked to students
  async findStudentContacts(tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:companies(id, naam),
        branch:branches(id, naam_vestiging),
        student:students(id, voornaam, tussenvoegsel, achternaam, personeelsnummer, emailadres, telefoonnummer, functie, afdeling, is_active)
      `)
      .eq('tenant_id', tenantId)
      .not('student_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}