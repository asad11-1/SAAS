// src/student/student.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Post()
  @Roles('super_admin', 'tenant_admin')
  create(@Body() createStudentDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.create(createStudentDto, tenantId);
  }

  @Get()
  @Roles('super_admin', 'tenant_admin', 'user')
  findAll(@Req() req, @Query() filters: any) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? filters.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.findAll(tenantId, filters);
  }

  // ✅ FIXED: Move specific routes BEFORE parameterized routes
  @Get('stats')
  @Roles('super_admin', 'tenant_admin', 'user')
  getStats(@Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.getStats(tenantId);
  }

  // ✅ FIXED: Move contacts route BEFORE :id route
  @Get('contacts')
  @Roles('super_admin', 'tenant_admin', 'user')
  findStudentContacts(@Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.findStudentContacts(tenantId);
  }

  // ✅ Now parameterized routes come AFTER specific routes
  @Get(':id')
  @Roles('super_admin', 'tenant_admin', 'user')
  findOne(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.query.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('super_admin', 'tenant_admin')
  update(@Param('id') id: string, @Body() updateStudentDto: any, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.update(id, updateStudentDto, tenantId);
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
    
    return this.studentService.remove(id, tenantId);
  }

  // ✅ Contact management endpoints
  @Post(':id/toggle-contact')
  @Roles('super_admin', 'tenant_admin')
  toggleContactStatus(@Param('id') id: string, @Body() body: { is_contact: boolean }, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.toggleContactStatus(id, tenantId, body.is_contact);
  }

  @Post(':id/set-primary-contact')
  @Roles('super_admin', 'tenant_admin')
  setAsPrimaryContact(@Param('id') id: string, @Req() req) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? req.body.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.setAsPrimaryContact(id, tenantId);
  }
}