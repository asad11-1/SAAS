// src/import/import.module.ts
import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthModule } from '../auth/auth.module'; // ✅ ADDED: Auth module import

@Module({
  imports: [AuthModule], // ✅ ADDED: Auth module import
  controllers: [ImportController],
  providers: [ImportService, SupabaseService],
})
export class ImportModule {}