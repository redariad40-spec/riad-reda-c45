import {
    CreateOptions,
    DeleteResult,
    FlattenMaps,
    HydratedDocument,
    Model,
    MongooseUpdateQueryOptions,
    ProjectionType,
    QueryOptions,
    RootFilterQuery,
    Types,
    UpdateQuery,
    UpdateResult,
  } from "mongoose";
  
  export type Lean<T> = FlattenMaps<T>; // ✅ تصحيح النوع لتبسيط النتائج
  
  export abstract class DatabaseRepository<TDocument> {
    protected constructor(protected readonly model: Model<TDocument>) {}
  
    async find({
      filter,
      select,
      options,
    }: {
      filter?: RootFilterQuery<TDocument>;
      select?: ProjectionType<TDocument> | null;
      options?: QueryOptions<TDocument> | null;
    }): Promise<(Lean<TDocument> | HydratedDocument<TDocument> | null)[]> {
      const doc = this.model.find(filter || {}).select(select || "");
      if (options?.lean) doc.lean(options.lean);
      if (options?.skip) doc.skip(options.skip);
      if (options?.limit) doc.limit(options.limit);
      return await doc.exec();
    }
  
    async findOne({
      filter,
      select,
      options,
    }: {
      filter?: RootFilterQuery<TDocument>;
      select?: ProjectionType<TDocument> | null;
      options?: QueryOptions<TDocument> | null;
    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
      const doc = this.model.findOne(filter).select(select || "");
      if (options?.lean) doc.lean(options.lean);
      return await doc.exec();
    }
  
    async findById({
      id,
      select,
      options,
    }: {
      id: Types.ObjectId;
      select?: ProjectionType<TDocument> | null;
      options?: QueryOptions<TDocument> | null;
    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
      const doc = this.model.findById(id).select(select || "");
      if (options?.lean) doc.lean(options.lean);
      return await doc.exec();
    }
  
    async create({
      data,
      options,
    }: {
      data: Partial<TDocument>[];
      options?: CreateOptions;
    }): Promise<HydratedDocument<TDocument>[]> {
      return await this.model.create(data, options);
    }
  
    async insertMany({
      data,
    }: {
      data: Partial<TDocument>[];
    }): Promise<HydratedDocument<TDocument>[]> {
      return (await this.model.insertMany(data)) as HydratedDocument<TDocument>[];
    }
  
    async updateOne({
      filter,
      update,
      options,
    }: {
      filter: RootFilterQuery<TDocument>;
      update: UpdateQuery<TDocument>;
      options?: MongooseUpdateQueryOptions<TDocument> | null;
    }): Promise<UpdateResult> {
      return await this.model.updateOne(
        filter,
        {
          ...update,
          $inc: { ...(update as any).$inc, __v: 1 },
        },
        options
      );
    }
  
    async findByIdAndUpdate({
      id,
      update,
      options = { new: true },
    }: {
      id: Types.ObjectId;
      update: UpdateQuery<TDocument>;
      options?: QueryOptions<TDocument> | null;
    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
      return await this.model.findByIdAndUpdate(
        id,
        {
          ...update,
          $inc: { ...(update as any).$inc, __v: 1 },
        },
        options
      );
    }
  
    async findOneAndUpdate({
      filter,
      update,
      options = { new: true },
    }: {
      filter?: RootFilterQuery<TDocument>;
      update: UpdateQuery<TDocument>;
      options?: QueryOptions<TDocument> | null;
    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
      return await this.model.findOneAndUpdate(
        filter,
        {
          ...update,
          $inc: { ...(update as any).$inc, __v: 1 },
        },
        options
      );
    }
  
    async findOneAndDelete({
      filter,
    }: {
      filter: RootFilterQuery<TDocument>;
    }): Promise<HydratedDocument<TDocument> | null> {
      return await this.model.findOneAndDelete(filter);
    }
  
    async deleteOne({
      filter,
    }: {
      filter: RootFilterQuery<TDocument>;
    }): Promise<DeleteResult> {
      return await this.model.deleteOne(filter);
    }
  
    async deleteMany({
      filter,
    }: {
      filter: RootFilterQuery<TDocument>;
    }): Promise<DeleteResult> {
      return await this.model.deleteMany(filter);
    }
  
    async paginate({
      filter = {},
      options = {},
      select,
      page = "all",
      size = 5,
    }: {
      filter?: RootFilterQuery<TDocument>;
      select?: ProjectionType<TDocument> | undefined;
      options?: QueryOptions<TDocument> | undefined;
      page?: number | "all";
      size?: number;
    }): Promise<{
      docscount?: number;
      limit?: number;
      pages?: number;
      currentPage?: number | undefined;
      result: (Lean<TDocument> | HydratedDocument<TDocument> | null)[];
    }> {
      let docscount: number | undefined;
      let pages: number | undefined;
      let currentPage: number | undefined;
  
      if (page !== "all") {
        const validPage = Math.max(1, Number(page) || 1);
        const limit = Math.max(1, Number(size) || 5);
        options.limit = limit;
        options.skip = (validPage - 1) * limit;
        currentPage = validPage;
      }
  
      docscount = await this.model.countDocuments(filter);
      pages = Math.ceil(docscount / (options.limit || docscount));
  
      const result = await this.find({ filter, select, options });
  
      return {
        docscount,
        limit: options.limit,
        pages,
        currentPage,
        result,
      };
    }
  }
  