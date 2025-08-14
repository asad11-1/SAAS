// src/student/student.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ ADDED: Authentication protection
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Post()
  @Roles('super_admin', 'tenant_admin') // ✅ ADDED: Role protection
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
  @Roles('super_admin', 'tenant_admin', 'user') // ✅ ADDED: Role protection
  findAll(@Req() req, @Query() filters: any) {
    const tenantId = req.tokenPayload?.role === 'super_admin' 
      ? filters.tenant_id || req.tenant?.id 
      : req.tenant?.id;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    return this.studentService.findAll(tenantId, filters);
  }

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
}
