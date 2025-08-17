// src/tenants/tenants.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import * as tenantsService_1 from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private tenantsService: tenantsService_1.TenantsService) {}

  @Post()
  @Roles('super_admin')
  async createTenant(@Body() createTenantDto: tenantsService_1.CreateTenantDto) {
    return this.tenantsService.createTenant(createTenantDto);
  }

  @Get()
  @Roles('super_admin')
  async getAllTenants() {
    return this.tenantsService.getAllTenants();
  }

  @Get('stats')
  @Roles('super_admin')
  async getTenantsStats() {
    return this.tenantsService.getTenantsStats();
  }

  @Get(':id')
  @Roles('super_admin')
  async getTenant(@Param('id') id: string) {
    return this.tenantsService.getTenant(id);
  }

  @Get(':id/users')
  @Roles('super_admin')
  async getTenantUsers(@Param('id') tenantId: string) {
    return this.tenantsService.getTenantUsers(tenantId);
  }

  @Get(':id/stats')
  @Roles('super_admin')
  async getTenantStats(@Param('id') tenantId: string) {
    return this.tenantsService.getTenantStats(tenantId);
  }

  // ✅ NEW: Create admin user for tenant
  @Post(':id/admins')
  @Roles('super_admin')
  async createTenantAdmin(
    @Param('id') tenantId: string, 
    @Body() adminData: tenantsService_1.CreateAdminDto
  ) {
    return this.tenantsService.createTenantAdmin(tenantId, adminData);
  }

  @Patch(':id')
  @Roles('super_admin')
  async updateTenant(@Param('id') id: string, @Body() updateData: any) {
    return this.tenantsService.updateTenant(id, updateData);
  }

  @Delete(':id')
  @Roles('super_admin')
  async deleteTenant(@Param('id') id: string) {
    return this.tenantsService.deleteTenant(id);
  }
}

// ✅ NEW: Users Controller for user management
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private tenantsService: tenantsService_1.TenantsService) {}

  @Patch(':id')
  @Roles('super_admin', 'tenant_admin')
  async updateUser(@Param('id') userId: string, @Body() updateData: any) {
    return this.tenantsService.updateUser(userId, updateData);
  }

  @Delete(':id')
  @Roles('super_admin', 'tenant_admin')
  async deleteUser(@Param('id') userId: string) {
    return this.tenantsService.deleteUser(userId);
  }

  @Post(':id/reset-password')
  @Roles('super_admin', 'tenant_admin')
  async resetUserPassword(
    @Param('id') userId: string, 
    @Body() resetData: { password: string }
  ) {
    return this.tenantsService.resetUserPassword(userId, resetData.password);
  }
}

// ✅ NEW: Admin Controller for system stats
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private tenantsService: tenantsService_1.TenantsService) {}

  @Get('stats')
  @Roles('super_admin')
  async getSystemStats() {
    return this.tenantsService.getSystemStats();
  }
}