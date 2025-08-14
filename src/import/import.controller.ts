// src/import/import.controller.ts
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ImportService } from './import.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  
  @Controller('import')
  @UseGuards(JwtAuthGuard, RolesGuard) // ✅ Authentication protection
  export class ImportController {
    constructor(private importService: ImportService) {}
  
    @Post('companies')
    @Roles('super_admin', 'tenant_admin') // ✅ Role protection
    @UseInterceptors(FileInterceptor('file'))
    async importCompanies(
      @UploadedFile() file: Express.Multer.File,
      @Req() req,
    ) {
      console.log('🔍 Import companies request:', {
        hasFile: !!file,
        filename: file?.originalname,
        userRole: req.tokenPayload?.role,
        tenantId: req.tokenPayload?.tenant_id,
      });
  
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
  
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        throw new BadRequestException('Only Excel files (.xlsx, .xls) are allowed');
      }
  
      // ✅ FIXED: Proper tenant ID extraction
      let tenantId: string;
      
      if (req.tokenPayload?.role === 'super_admin') {
        // Super admin can specify tenant_id in request body or use default
        tenantId = req.body?.tenant_id || 'default-tenant-id';
        console.log('🔧 Super admin import, using tenant_id:', tenantId);
      } else {
        // Regular tenant admin uses their own tenant
        tenantId = req.tokenPayload?.tenant_id;
        console.log('🏢 Tenant admin import, using tenant_id:', tenantId);
      }
      
      if (!tenantId) {
        console.error('❌ No tenant ID found in request');
        throw new BadRequestException('Tenant ID is required');
      }
  
      try {
        const result = await this.importService.importCompanies(file.buffer, tenantId);
        console.log('✅ Companies import completed:', result);
        return result;
      } catch (error) {
        console.error('❌ Companies import error:', error);
        throw error;
      }
    }
  
    @Post('students')
    @Roles('super_admin', 'tenant_admin') // ✅ Role protection
    @UseInterceptors(FileInterceptor('file'))
    async importStudents(
      @UploadedFile() file: Express.Multer.File,
      @Req() req,
    ) {
      console.log('🔍 Import students request:', {
        hasFile: !!file,
        filename: file?.originalname,
        userRole: req.tokenPayload?.role,
        tenantId: req.tokenPayload?.tenant_id,
      });
  
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
  
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        throw new BadRequestException('Only Excel files (.xlsx, .xls) are allowed');
      }
  
      // ✅ FIXED: Proper tenant ID extraction
      let tenantId: string;
      
      if (req.tokenPayload?.role === 'super_admin') {
        // Super admin can specify tenant_id in request body or use default
        tenantId = req.body?.tenant_id || 'default-tenant-id';
        console.log('🔧 Super admin import, using tenant_id:', tenantId);
      } else {
        // Regular tenant admin uses their own tenant
        tenantId = req.tokenPayload?.tenant_id;
        console.log('🏢 Tenant admin import, using tenant_id:', tenantId);
      }
      
      if (!tenantId) {
        console.error('❌ No tenant ID found in request');
        throw new BadRequestException('Tenant ID is required');
      }
  
      try {
        const result = await this.importService.importStudents(file.buffer, tenantId);
        console.log('✅ Students import completed:', result);
        return result;
      } catch (error) {
        console.error('❌ Students import error:', error);
        throw error;
      }
    }
  }