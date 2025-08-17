// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthModule } from '../auth/auth.module'; // ✅ ADDED: Auth module import

@Module({
  imports: [AuthModule], // ✅ ADDED: Auth module import
  controllers: [StudentController],
  providers: [StudentService, SupabaseService],
})
export class StudentModule {}