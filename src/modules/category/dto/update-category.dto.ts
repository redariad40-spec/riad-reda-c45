import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';
import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { containFiled } from 'src/common';
import { CreateCategoryDto } from './create-category.dto';



@containFiled()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }


export class UpdateParamDto {

    @IsMongoId()
    CategoryId: Types.ObjectId;
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