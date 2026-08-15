import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetAllDto, UpdateCategoryDto } from './dto/update-category.dto';
import { BrandRepository, CategoryDocument, CategoryRepository, UserDocument } from 'src/DB';
import { S3Service } from 'src/common/service/s3.service';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/repository/database.repository';
import { FolderEnum } from 'src/common';
import { HydratedDocument } from 'mongoose';

@Injectable()
export class CategoryService {
   constructor(
      private readonly categoryRepository: CategoryRepository,
      private readonly brandRepository:BrandRepository,
      private readonly s3Service: S3Service
    ) { }
  
    async create(
      createCategoryDto: CreateCategoryDto,
      file: Express.Multer.File,
      user: UserDocument
    ): Promise<CategoryDocument> {
      const { slogan, name } = createCategoryDto;
  
      const checkDublicated = await this.categoryRepository.findOne({
        filter: { name },
      });
  
      if (checkDublicated) {
        throw new ConflictException('duplicated Category name');
      }
  
      const image: string = await this.s3Service.uploadFile({
        file,
        path: 'Category',
      });
  
      // ✅ استخدم الحقل الصحيح الموجود في الـ schema
      const CategoryArray = await this.categoryRepository.create({
        data: [{ name, slogan: slogan, createdBy: user._id, image }],
      });
  
      // ✅ لو create بترجع array، ناخد أول عنصر
      const category = Array.isArray(CategoryArray) ? CategoryArray[0] : CategoryArray;
  
      if (!category) {
        await this.s3Service.deleteFile({ Key: image });
        throw new BadRequestException('Failed to create this category');
      }
  
      return category;
    }
  
    async update(
      CategoryId: Types.ObjectId,
      updateCategoryDto: UpdateCategoryDto,
      user: UserDocument
  
    ): Promise<CategoryDocument | Lean<CategoryDocument>> {
  
      if (
        updateCategoryDto.name
        && (await this.categoryRepository.findOne({
          filter: { name: updateCategoryDto.name },
        }))) {
        throw new ConflictException("Dublicated category name")
  
      }
      const category = await this.categoryRepository.findOneAndUpdate({
        filter: { _id: CategoryId },
        update: {
          ...updateCategoryDto,
          updatedBy: user._id
        },
      });
      if (!category) {
        throw new NotFoundException("fail to the find category")
  
      }
      return category;
    }
  
    async updateAttachment(
      CategoryId: Types.ObjectId,
      file: Express.Multer.File,
      user: UserDocument
  
    ): Promise<CategoryDocument | Lean<CategoryDocument>> {
  
      const image = await this.s3Service.uploadFile({
        file,
        path: FolderEnum.Catgory
      });
      const category = await this.categoryRepository.findOneAndUpdate({
        filter: { _id: CategoryId },
        update: {
          image,
          updatedBy: user._id
        },
        options: {
          new: false,
        },
      });
  
      if (!category) {
        await this.s3Service.deleteFile({ Key: image });
        throw new NotFoundException("fail to the find category")
      }
  
      await this.s3Service.deleteFile({ Key: category.image });
      category.image = image;
      return category;
    }
  
    async freeze(
      CategoryId: Types.ObjectId,
      user: UserDocument
    ): Promise<string> {
      const category = await this.categoryRepository.findOneAndUpdate({
        filter: { _id: CategoryId },
  
        update: {
          freezedAt: new Date(),
          $unset: { restored: true },
          updatedBy: user._id
        },
        options: {
          new: false,
        },
      });
  
      if (!category) {
        throw new NotFoundException("fail to the find category")
      }
      return "Done";
    }
    async restore(
      CategoryId: Types.ObjectId,
      user: UserDocument
    ): Promise<CategoryDocument | Lean<CategoryDocument>> {
  
  
      const category = await this.categoryRepository.findOneAndUpdate({
        filter: { _id: CategoryId, paranoid: false, freezedAt: { $exists: true } },
  
        update: {
          restoredAt: new Date(),
          $unset: { freezedAt: true },
          updatedBy: user._id
        },
        options: {
          new: false,
        },
      });
  
      if (!category) {
        throw new NotFoundException("fail to the find category");
      }
  
      return category;
    }
  
    async remove(
      CategoryId: Types.ObjectId,
      user: UserDocument
    ): Promise<string> {
  
      const category = await this.categoryRepository.findOneAndDelete({
  
        filter: { _id: CategoryId, paranoid: false, freezedAt: { $exists: true } },
      });
  
      if (!category) {
        throw new NotFoundException("fail to the find category");
      }
      await this.s3Service.deleteFile({ Key: category.image })
      return "done";
    }
  
    async findAll(
      data: GetAllDto,
      archive: boolean = false
  
    ): Promise<{
      docscount?: number;
      limit?: number;
      pages?: number;
      currentPage?: number | undefined;
      result: (Lean<CategoryDocument> | HydratedDocument<CategoryDocument> | null)[];
    }> {
      const { page, size, search } = data;
      const result = await this.categoryRepository.paginate({
        filter: {
          ...(search
            ? {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } },
                { slogan: { $regex: search, $options: "i" } },
              ],
            }
            : {}),
          ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
        },
        page,
        size,
      });
  
      return result;
    }
  
  
  
    async findOne(
      CategoryId: Types.ObjectId,
      archive: boolean = false
  
    ): Promise<CategoryDocument | Lean<CategoryDocument>> {
      const category = await this.categoryRepository.findOne({
        filter: {
          _id: CategoryId,
          ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
        },
  
      });
      if (!category) {
        throw new NotFoundException("fail to the find category interface")
  
      }
  
      return category;
    }
  
}
