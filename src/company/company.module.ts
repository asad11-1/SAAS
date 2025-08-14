// src/company/company.module.ts
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthModule } from '../auth/auth.module'; // ✅ ADDED: Auth module import

@Module({
  imports: [AuthModule], // ✅ ADDED: Auth module import
  controllers: [CompanyController],
  providers: [CompanyService, SupabaseService],
})
export class CompanyModule {}