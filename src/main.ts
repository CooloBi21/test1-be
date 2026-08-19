import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // 1. Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 2. Thêm ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường dữ liệu thừa không có trong DTO
      transform: true, // Tự động convert kiểu dữ liệu phù hợp
    }),
  );

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Rental Rooms & Locations API (NestJS)')
    .setDescription('Tài liệu và giao diện thử nghiệm API nâng cấp NestJS')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const PORT = Number(process.env.PORT) || 5000;
  await app.listen(PORT, '0.0.0.0');

  console.log(`Backend NestJS running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
}
bootstrap();