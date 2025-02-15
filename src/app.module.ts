import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsFailoverModule } from './dns-failover.module';
import { VisitorController } from './controllers/visitor.controller';
import { VisitorService } from './services/visitor.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', '..', 'client/public/browser'),
        }),
      ],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT as string) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'test',
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      }),
      inject: [],
    }),
    DnsFailoverModule,
  ],
  controllers: [VisitorController],
  providers: [VisitorService],
})
export class AppModule {}