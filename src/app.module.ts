// src/app.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { CompanyModule } from './company/company.module';
import { BranchModule } from './branch/branch.module';
import { StudentModule } from './student/student.module';
import { ImportModule } from './import/import.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { SupabaseService } from './common/supabase.service';
import { JwtService } from './auth/jwt.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    TenantsModule,
    CompanyModule,
    BranchModule,
    StudentModule,
    ImportModule,
  ],
  providers: [SupabaseService, JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}