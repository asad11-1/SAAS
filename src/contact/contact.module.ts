import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ContactController],
  providers: [ContactService, SupabaseService],
  exports: [ContactService],
})
export class ContactModule {}