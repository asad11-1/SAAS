import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @Roles('super_admin', 'tenant_admin')
  create(@Body() createContactDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.contactService.create(createContactDto, tenantId);
  }

  @Get()
  @Roles('super_admin', 'tenant_admin', 'user')
  findAll(@Req() req, @Query('company_id') companyId?: string, @Query('branch_id') branchId?: string) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.contactService.findAll(tenantId, companyId, branchId);
  }

  @Get('by-company/:companyId')
  @Roles('super_admin', 'tenant_admin', 'user')
  findByCompany(@Param('companyId') companyId: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.contactService.findByCompany(companyId, tenantId);
  }

  @Get('by-branch/:branchId')
  @Roles('super_admin', 'tenant_admin', 'user')
  findByBranch(@Param('branchId') branchId: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.contactService.findByBranch(branchId, tenantId);
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
    
    return this.contactService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('super_admin', 'tenant_admin')
  update(@Param('id') id: string, @Body() updateContactDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.contactService.update(id, updateContactDto, tenantId);
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
    
    return this.contactService.remove(id, tenantId);
  }

  @Post(':id/set-primary')
  @Roles('super_admin', 'tenant_admin')
  setPrimary(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.contactService.setPrimary(id, tenantId);
  }
}