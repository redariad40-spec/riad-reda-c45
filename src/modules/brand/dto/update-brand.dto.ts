import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { Types } from 'mongoose';
import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { containFiled } from 'src/common';



@containFiled()
export class UpdateBrandDto extends PartialType(CreateBrandDto) { }


export class UpdateParamDto {

    @IsMongoId()
    brandId: Types.ObjectId;
}

export class GetAllDto {
    @IsPositive()
    @IsNumber()
    @IsOptional()
    page: number;

    @IsPositive()
    @IsNumber()
    @IsOptional()
    size: number;

    @IsString()
    @IsOptional()
    search: string
}