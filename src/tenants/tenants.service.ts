// src/tenants/tenants.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import * as bcrypt from 'bcrypt';

export interface CreateTenantDto {
  subdomain: string;
  company_name: string;
  plan_type?: string;
  max_students?: number;
  max_branches?: number;
  admin_email: string;
  admin_password: string;
  admin_first_name: string;
  admin_last_name: string;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

@Injectable()
export class TenantsService {
  constructor(private supabaseService: SupabaseService) {}

  async createTenant(createTenantDto: CreateTenantDto) {
    const supabase = this.supabaseService.getClient();
    
    // Check if subdomain already exists
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', createTenantDto.subdomain)
      .single();

    if (existing) {
      throw new BadRequestException('Subdomain already exists');
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        subdomain: createTenantDto.subdomain,
        company_name: createTenantDto.company_name,
        plan_type: createTenantDto.plan_type || 'trial',
        max_students: createTenantDto.max_students || 100,
        max_branches: createTenantDto.max_branches || 5,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (tenantError) {
      throw new BadRequestException('Failed to create tenant');
    }

    // Create admin user for this tenant
    const hashedPassword = await bcrypt.hash(createTenantDto.admin_password, 10);
    
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .insert({
        tenant_id: tenant.id,
        email: createTenantDto.admin_email,
        password_hash: hashedPassword,
        first_name: createTenantDto.admin_first_name,
        last_name: createTenantDto.admin_last_name,
        role: 'tenant_admin',
        tenant_admin: true,
      })
      .select()
      .single();

    if (userError) {
      // Rollback tenant creation
      await supabase.from('tenants').delete().eq('id', tenant.id);
      throw new BadRequestException('Failed to create admin user');
    }

    return {
      tenant,
      admin_user: {
        id: adminUser.id,
        email: adminUser.email,
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
      },
    };
  }

  async getAllTenants() {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        users!inner(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getTenant(id: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Tenant not found');
    }
    
    return data;
  }

  async getTenantUsers(tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, last_login, created_at, tenant_admin')
      .eq('tenant_id', tenantId)
      .order('tenant_admin', { ascending: false }) // Admins first
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ✅ NEW: Create tenant admin
  async createTenantAdmin(tenantId: string, adminData: CreateAdminDto) {
    const supabase = this.supabaseService.getClient();

    // Verify tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if email already exists in this tenant
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminData.email)
      .eq('tenant_id', tenantId)
      .single();

    if (existingUser) {
      throw new BadRequestException('User with this email already exists in this tenant');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    const { data: newAdmin, error: adminError } = await supabase
      .from('users')
      .insert({
        tenant_id: tenantId,
        email: adminData.email,
        password_hash: hashedPassword,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        role: 'tenant_admin',
        tenant_admin: true,
        is_active: true,
      })
      .select('id, email, first_name, last_name, role, is_active, created_at, tenant_admin')
      .single();

    if (adminError) {
      throw new BadRequestException('Failed to create admin user');
    }

    return newAdmin;
  }

  // ✅ NEW: Update user
  async updateUser(userId: string, updateData: any) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, is_active, last_login, created_at, tenant_admin')
      .single();

    if (error) {
      throw new BadRequestException('Failed to update user');
    }

    return data;
  }

  // ✅ NEW: Delete user
  async deleteUser(userId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new BadRequestException('Failed to delete user');
    }

    return { message: 'User deleted successfully' };
  }

  // ✅ NEW: Reset user password
  async resetUserPassword(userId: string, newPassword: string) {
    const supabase = this.supabaseService.getClient();
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name')
      .single();

    if (error) {
      throw new BadRequestException('Failed to reset password');
    }

    return { 
      message: 'Password reset successfully',
      user: data 
    };
  }

  // ✅ NEW: Get tenant statistics
  async getTenantStats(tenantId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Get user counts
    const { data: userStats } = await supabase
      .from('users')
      .select('id, is_active, tenant_admin')
      .eq('tenant_id', tenantId);

    // Get company count
    const { count: companyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get branch count
    const { count: branchCount } = await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get student count
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const totalUsers = userStats?.length || 0;
    const activeUsers = userStats?.filter(u => u.is_active).length || 0;
    const adminUsers = userStats?.filter(u => u.tenant_admin).length || 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
      },
      companies: companyCount || 0,
      branches: branchCount || 0,
      students: studentCount || 0,
    };
  }

  // ✅ NEW: Get overall tenant statistics
  async getTenantsStats() {
    const supabase = this.supabaseService.getClient();
    
    // Get tenant counts
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, is_active, plan_type');

    // Get total user count across all tenants
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total company count across all tenants
    const { count: totalCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    // Get total student count across all tenants
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    const totalTenants = tenants?.length || 0;
    const activeTenants = tenants?.filter(t => t.is_active).length || 0;
    
    // Plan distribution
    const planDistribution = tenants?.reduce((acc, tenant) => {
      acc[tenant.plan_type] = (acc[tenant.plan_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        inactive: totalTenants - activeTenants,
        byPlan: planDistribution,
      },
      users: totalUsers || 0,
      companies: totalCompanies || 0,
      students: totalStudents || 0,
    };
  }

  // ✅ NEW: Get system-wide statistics
  async getSystemStats() {
    const supabase = this.supabaseService.getClient();
    
    // Get all stats in parallel
    const [
      tenantStats,
      { count: totalUsers },
      { count: totalCompanies },
      { count: totalStudents },
      { count: totalBranches },
    ] = await Promise.all([
      this.getTenantsStats(),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('branches').select('*', { count: 'exact', head: true }),
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { count: recentUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    const { count: recentStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    return {
      overview: {
        totalTenants: tenantStats.tenants.total,
        activeTenants: tenantStats.tenants.active,
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0,
        totalStudents: totalStudents || 0,
        totalBranches: totalBranches || 0,
      },
      planDistribution: tenantStats.tenants.byPlan,
      recentActivity: {
        newUsers: recentUsers || 0,
        newStudents: recentStudents || 0,
      },
      tenantStats,
    };
  }

  async updateTenant(id: string, updateData: any) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('tenants')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to update tenant');
    }
    
    return data;
  }

  async deleteTenant(id: string) {
    const supabase = this.supabaseService.getClient();
    
    // First, delete all users in this tenant
    await supabase
      .from('users')
      .delete()
      .eq('tenant_id', id);

    // Delete all companies (cascading will handle branches, students)
    await supabase
      .from('companies')
      .delete()
      .eq('tenant_id', id);

    // Finally, delete the tenant
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException('Failed to delete tenant');
    }

    return { message: 'Tenant deleted successfully' };
  }
}