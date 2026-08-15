import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { AuthenticationModule } from '../auth/auth.module';
import { BrandRepository, CategoryRepository } from 'src/DB';
import { S3Service } from 'src/common/service/s3.service';

@Module({
  imports:[CategoryModule,AuthenticationModule],
  controllers: [CategoryController],
  providers: [CategoryService,CategoryRepository,BrandRepository,S3Service],
})
export class CategoryModule {}
