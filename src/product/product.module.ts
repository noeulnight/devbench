import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PurchaseModule } from 'src/purchase/purchase.module';

@Module({
  imports: [PrismaModule, PurchaseModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
