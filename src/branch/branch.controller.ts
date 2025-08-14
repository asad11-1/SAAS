import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Post()
  @Roles('super_admin', 'tenant_admin')
  create(@Body() createBranchDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.branchService.create(createBranchDto, tenantId);
  }

  @Get()
  @Roles('super_admin', 'tenant_admin', 'user')
  findAll(@Req() req, @Query('company_id') companyId?: string) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.branchService.findAll(tenantId, companyId);
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
    
    return this.branchService.findByCompany(companyId, tenantId);
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
    
    return this.branchService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('super_admin', 'tenant_admin')
  update(@Param('id') id: string, @Body() updateBranchDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.branchService.update(id, updateBranchDto, tenantId);
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
    
    return this.branchService.remove(id, tenantId);
  }
}
