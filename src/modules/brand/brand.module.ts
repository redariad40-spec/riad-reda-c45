import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandRepository } from 'src/DB';
import { S3Service } from 'src/common/service/s3.service';
import { AuthenticationModule } from '../auth/auth.module';

@Module({
  imports: [BrandModel, AuthenticationModule],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository, S3Service],
})
export class BrandModule { }
