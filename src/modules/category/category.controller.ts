import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetAllDto, UpdateCategoryDto, UpdateParamDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFiledUpload, FileValidation } from 'src/common/utlis/multer';
import { endpoint } from './entities/authorization.module';
import { Auth, IResponse, successResponse, User } from 'src/common';
import type { UserDocument } from 'src/DB';
import { GetAllResponse } from '../brand/entities/brand.entity';
import { CategoryResponse } from './entities/category.entitiy';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService) {}

  @UseInterceptors(
     FileInterceptor(
       'attachment',
       cloudFiledUpload({ validation: FileValidation.image })))
 
 
   @Auth(endpoint.create)
   @Post()
   async create(
     @Body() createCategoryDto: CreateCategoryDto,
     @User() user: UserDocument,
     @UploadedFile(ParseFilePipe) file: Express.Multer.File
   ): Promise<IResponse<CategoryResponse>> {
     const category = await this.categoryService.create(createCategoryDto, file, user);
     return successResponse<CategoryResponse>({ status: 201, data: { category } });
   }
 
   @Auth(endpoint.create)
   @Patch(':CategoryId')
   async update(
     @Param() params: UpdateParamDto,
     @User() user: UserDocument,
     @Body() updateCategoryDto: UpdateCategoryDto
 
   ): Promise<IResponse<CategoryResponse>> {
 
     const category = await this.categoryService.update(params.CategoryId, updateCategoryDto, user);
     return successResponse<CategoryResponse>({ status: 201, data: { category } });
   }
 
   @UseInterceptors(
     FileInterceptor(
       'attachment',
       cloudFiledUpload({ validation: FileValidation.image })))
 
   @Auth(endpoint.create)
   @Patch(':CategoryId/attachment')
   async updateAttachment(
     @Param() params: UpdateParamDto,
     @User() user: UserDocument,
     @UploadedFile(ParseFilePipe) file: Express.Multer.File,
 
   ): Promise<IResponse<CategoryResponse>> {
 
     const category = await this.categoryService.updateAttachment(params.CategoryId, file, user);
     return successResponse<CategoryResponse>({ data: { category } });
   }
 
 
   @Auth(endpoint.create)
   @Delete(':CategoryId/freeze')
   async freeze(
     @Param() params: UpdateParamDto,
     @User() user: UserDocument
   ): Promise<IResponse> {
     await this.categoryService.freeze(params.CategoryId, user)
     return successResponse();
   }
 
   @Auth(endpoint.create)
   @Patch(':CategoryId/restore')
 
   async restore(
     @Param() params: UpdateParamDto,
     @User() user: UserDocument
   ): Promise<IResponse<CategoryResponse>> {
 
     const category = await this.categoryService.restore(params.CategoryId, user);
     return successResponse<CategoryResponse>({ data: { category } });
   }
 
   @Auth(endpoint.create)
   @Delete(':CategoryId')
   async remove(
     @Param() params: UpdateParamDto,
     @User() user: UserDocument
   ): Promise<IResponse> {
     await this.categoryService.remove(params.CategoryId, user)
     return successResponse();
   }
 
   @Get()
   async findAll(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse>> {
     const result = await this.categoryService.findAll(query);
     return successResponse<GetAllResponse>({ data: { result } });
   }
 
   @Auth(endpoint.create)
   @Get('/archive')
   async findAllArchives(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse>> {
     const result = await this.categoryService.findAll(query, true);
     return successResponse<GetAllResponse>({ data: { result } });
   }
 
   @Auth(endpoint.create)
   @Get(':CategoryId')
   async findOne(@Param() params: UpdateParamDto) {
     const category = await this.categoryService.findOne(params.CategoryId);
     return successResponse<CategoryResponse>({ data: { category } })
   }
 
   @Auth(endpoint.create)
   @Get(':CategoryId/archive')
   async findOneArchives(@Param() params: UpdateParamDto) {
     const category = await this.categoryService.findOne(params.CategoryId, true);
     return successResponse<CategoryResponse>({ data: { category } })
   }
 
}
