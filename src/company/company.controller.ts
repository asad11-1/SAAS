// src/company/company.controller.ts - Updated with branch conversion endpoints

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

export interface ConvertToBranchDto {
  parent_company_id: string;
  confirm_warnings?: boolean;
}

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

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @Roles('super_admin', 'tenant_admin')
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
  @Roles('super_admin', 'tenant_admin', 'user')
  findAll(@Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.companyService.findAll(tenantId);
  }

  @Get('convertible')
  @Roles('super_admin', 'tenant_admin')
  async getConvertibleCompanies(@Req() req): Promise<ConvertibleCompany[]> {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.companyService.getConvertibleCompanies(tenantId);
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

  @Post(':id/validate-conversion')
  @Roles('super_admin', 'tenant_admin')
  async validateConversion(
    @Param('id') id: string,
    @Body() body: { parent_company_id: string },
    @Req() req
  ): Promise<ConversionValidationResponse> {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!body.parent_company_id) {
      throw new Error('Parent company ID is required');
    }

    return this.companyService.validateConversion(id, body.parent_company_id, tenantId);
  }

  @Post(':id/convert-to-branch')
  @Roles('super_admin', 'tenant_admin')
  async convertToBranch(
    @Param('id') id: string,
    @Body() convertDto: ConvertToBranchDto,
    @Req() req
  ) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!convertDto.parent_company_id) {
      throw new Error('Parent company ID is required');
    }

    // First validate the conversion
    const validation = await this.companyService.validateConversion(
      id, 
      convertDto.parent_company_id, 
      tenantId
    );

    if (!validation.can_convert) {
      throw new Error(`Cannot convert company: ${validation.errors.join(', ')}`);
    }

    // If there are warnings and user hasn't confirmed, require confirmation
    if (validation.warnings.length > 0 && !convertDto.confirm_warnings) {
      return {
        success: false,
        requires_confirmation: true,
        validation: validation,
        message: 'Conversion requires confirmation due to warnings'
      };
    }

    try {
      const result = await this.companyService.convertToBranch(
        id, 
        convertDto.parent_company_id, 
        tenantId
      );

      return {
        success: true,
        branch_id: result.branch_id,
        message: 'Company successfully converted to branch',
        impact: validation.impact
      };
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  @Get(':id/conversion-history')
  @Roles('super_admin', 'tenant_admin')
  async getConversionHistory(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.companyService.getConversionHistory(id, tenantId);
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