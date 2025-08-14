// src/tenants/tenants.module.ts
import { Module } from '@nestjs/common';
import { TenantsController, UsersController, AdminController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    TenantsController, 
    UsersController,    // ✅ NEW: User management
    AdminController     // ✅ NEW: System admin stats
  ],
  providers: [TenantsService, SupabaseService],
  exports: [TenantsService],
})
export class TenantsModule {}