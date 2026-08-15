import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from 'src/DB';
import { AuthenticationModule } from '../auth/auth.module';

@Module({
  imports:[ProductModule,AuthenticationModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class ProductModule {}
