// src/branch/branch.controller.ts - Updated with converted companies endpoints

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

  @Get('converted')
  @Roles('super_admin', 'tenant_admin', 'user')
  getConvertedBranches(@Req() req, @Query('company_id') companyId?: string) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.branchService.getConvertedBranches(tenantId, companyId);
  }

  @Get('stats')
  @Roles('super_admin', 'tenant_admin')
  getBranchStats(@Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.branchService.getBranchStats(tenantId);
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

  @Get(':id/original-company')
  @Roles('super_admin', 'tenant_admin', 'user')
  getOriginalCompanyData(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.branchService.getOriginalCompanyData(id, tenantId);
  }

  @Get(':id/similar')
  @Roles('super_admin', 'tenant_admin')
  findSimilarBranches(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.branchService.findSimilarBranches(id, tenantId);
  }

  @Post(':id/revert-to-company')
  @Roles('super_admin', 'tenant_admin')
  revertBranchToCompany(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.branchService.revertBranchToCompany(id, tenantId);
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