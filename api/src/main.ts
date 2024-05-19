import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  if (process.env.NODE_ENV === 'production') {
    // TODO: serve static
  } else {
    app.enableCors();
  }
  await app.listen(3001);
}
bootstrap();
