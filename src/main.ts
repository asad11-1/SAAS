import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific configuration
  app.enableCors({
    origin: [
      'http://localhost:3002',        // Local frontend
      'http://localhost:3000',        // Alternative local port
      'https://conceptkooistra.nl',   // Production domain
      'http://conceptkooistra.nl',    // HTTP fallback
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-subdomain',
      'X-Subdomain',
    ],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000); // Change to 3000 to match nginx proxy
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();