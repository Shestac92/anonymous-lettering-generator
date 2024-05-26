import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(helmet());

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  await app.listen(3001);
}
bootstrap();
