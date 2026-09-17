import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  Logger,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';

type SwaggerOperation = { get: (key: string) => string };

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', process.env.TRUST_PROXY ?? 1);
  app.use(helmet());

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const corsOrigin = frontendUrl.includes(',')
    ? frontendUrl.split(',').map((s) => s.trim())
    : frontendUrl;

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey.replace('Controller', '')}_${methodKey}`,
  });
  SwaggerModule.setup('api/v1/docs', app, document, {
    yamlDocumentUrl: '/api/v1/swagger.yaml',
    swaggerOptions: {
      operationsSorter: (a: SwaggerOperation, b: SwaggerOperation) => {
        const rank: Record<string, number> = {
          get: 1,
          post: 2,
          put: 3,
          patch: 4,
          delete: 5,
        };
        const rankA = rank[a.get('method')] ?? 99;
        const rankB = rank[b.get('method')] ?? 99;
        return rankA - rankB || a.get('path').localeCompare(b.get('path'));
      },
      tagsSorter: (a: string, b: string) => {
        const order = ['API', 'Auth'];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      },
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Swagger UI available at http://localhost:${port}/api/v1/docs`);
}

void bootstrap();
