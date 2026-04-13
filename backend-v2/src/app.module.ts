import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

// ==================== Import All Modules ====================

import { UsersModule } from './modules/users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArtworksModule } from './modules/artworks/artworks.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ContestsModule } from './modules/contests/contests.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { OrdersModule } from './modules/orders/orders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        '.env.local',
        '.env.development',
        '.env.production',
      ],
    }),

    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',

        migrations: [join(__dirname, 'database/migrations/*{.ts,.js}')],
        migrationsRun: configService.get<string>('NODE_ENV') !== 'development',
        migrationsTableName: 'migrations',

        logging: configService.get<string>('NODE_ENV') === 'development',
        logger: 'advanced-console',

        poolSize: 20,
        maxQueryExecutionTime: 1000,

        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,

        extra: {
          max: 25,
          idleTimeoutMillis: 30000,
        },
      }),
    }),

    // ====================== All Modules ======================
    AuthModule,
    UsersModule,
    RbacModule,
    ArtworksModule,
    BrandsModule,
    ContestsModule,
    CollectionsModule,
    OrdersModule,
    NotificationsModule,
    SearchModule,
  ],
})
export class AppModule {}
