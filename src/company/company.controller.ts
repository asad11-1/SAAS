// src/company/company.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ ADDED: Authentication protection
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @Roles('super_admin', 'tenant_admin') // ✅ ADDED: Role protection
  create(@Body() createCompanyDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.companyService.create(createCompanyDto, tenantId);
  }

  @Get()
  @Roles('super_admin', 'tenant_admin', 'user') // ✅ ADDED: Role protection
  findAll(@Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.companyService.findAll(tenantId);
  }

  @Get(':id')
  @Roles('super_admin', 'tenant_admin', 'user')
  findOne(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.companyService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('super_admin', 'tenant_admin')
  update(@Param('id') id: string, @Body() updateCompanyDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.companyService.update(id, updateCompanyDto, tenantId);
  }

  @Delete(':id')
  @Roles('super_admin', 'tenant_admin')
  remove(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.companyService.remove(id, tenantId);
  }
}
