import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SectionsModule } from './sections/sections.module';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { SlidesModule } from './slides/slides.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SectionsModule,
    ProductsModule,
    AuthModule,
    UploadsModule,
    SlidesModule,
    // AuthModule se agrega solo en el paso 15
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
