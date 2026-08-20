"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL || true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Rental Rooms & Locations API (NestJS)')
        .setDescription('Tài liệu và giao diện thử nghiệm API nâng cấp NestJS')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const PORT = Number(process.env.PORT) || 5000;
    await app.listen(PORT, '0.0.0.0');
    console.log(`🚀 Backend NestJS running on port ${PORT}`);
    console.log(`📄 Swagger UI available at http://localhost:${PORT}/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map