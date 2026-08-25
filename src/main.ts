import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Bật CORS (Lấy danh sách origin được phép bao gồm cả Local và Production Vercel)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL, // Ví dụ: https://test1-lake-ten.vercel.app
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Lọc bỏ các field không hợp lệ ngoài DTO
      transform: true, // Tự động ép kiểu dữ liệu phù hợp
    }),
  );

  // 3. Cấu hình tài liệu API Swagger
  const config = new DocumentBuilder()
    .setTitle('Rental Rooms & Locations API (NestJS)')
    .setDescription('Tài liệu và giao diện thử nghiệm API nâng cấp NestJS')
    .setVersion('1.0')
    .addBearerAuth() // Bổ sung ô nhập Bearer Token trên giao diện Swagger
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 4. Lắng nghe Port và Bind Address '0.0.0.0' cho Cloud/Docker
  const PORT = Number(process.env.PORT) || 5000;
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Backend NestJS running on port ${PORT}`);
  console.log(`📄 Swagger UI available at http://localhost:${PORT}/api-docs`);
}
bootstrap();