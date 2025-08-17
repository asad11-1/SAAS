// src/branch/branch.module.ts
import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthModule } from '../auth/auth.module'; // ✅ ADDED: Auth module import

@Module({
  imports: [AuthModule], // ✅ ADDED: Auth module import
  controllers: [BranchController],
  providers: [BranchService, SupabaseService],
})
export class BranchModule {}