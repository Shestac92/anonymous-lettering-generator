import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const isProd = process.env.NODE_ENV === 'production';
const staticRoot = isProd
  ? join(__dirname, '..', '..', 'client', 'build')
  : join(__dirname, '..', '..', 'client', 'build');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: staticRoot,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
