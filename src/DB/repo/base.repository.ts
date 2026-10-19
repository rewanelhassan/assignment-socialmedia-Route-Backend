import {
  CreateOptions,
  HydratedDocument,
  Model,
  QueryFilter,
  ProjectionType,
  QueryOptions,
  FlattenMaps,
  PopulateOptions,
  Types,
  UpdateQuery,
  MongooseUpdateQueryOptions,
  UpdateResult,
  DeleteResult,
} from "mongoose";

export abstract class BaseRepository<T> {
  constructor(private model: Model<T>) {}

  create({ data }: { data: Partial<T> }): Promise<HydratedDocument<T>>;
  create({
    data,
    options,
  }: {
    data: Partial<T>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<T>[]>;

  create({
    data,
    options,
  }: {
    data: Partial<T>[] | Partial<T>;
    options?: CreateOptions;
  }): Promise<HydratedDocument<T> | HydratedDocument<T>[]> {
    return this.model.create(data as any, options);
  }

  findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T> & { lean: false };
  }): Promise<HydratedDocument<T> | null>;

  findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T> & { lean: true };
  }): Promise<FlattenMaps<T> | null>;

  findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T> | FlattenMaps<T> | null> {
    const doc = this.model.findOne(filter, projection);
    if (options?.lean) {
      doc.lean() as FlattenMaps<T>;
    }
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions);
    }
    return doc;
  }

  findById({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T> & { lean: false };
  }): Promise<HydratedDocument<T> | null>;

  findById({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T> & { lean: true };
  }): Promise<FlattenMaps<T> | null>;

  findById({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T> | FlattenMaps<T> | null> {
    const doc = this.model.findById(id, projection);
    if (options?.lean) {
      doc.lean() as FlattenMaps<T>;
    }
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions);
    }
    return doc;
  }

  updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: MongooseUpdateQueryOptions;
  }): Promise<UpdateResult> {
    return this.model.updateOne(filter, update, options);
  }
  updateMany({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: MongooseUpdateQueryOptions;
  }): Promise<UpdateResult> {
    return this.model.updateMany(filter, update, options);
  }
  deleteOne({ filter }: { filter: QueryFilter<T> }): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }
  deleteMany({ filter }: { filter: QueryFilter<T> }): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }

  findOneAndUpdate({
    filter,
    update,
    options = { new: true },
  }: {
    filter: QueryFilter<T>;
    update?: UpdateQuery<T>;
    options?: QueryOptions<T> | null;
  }): Promise<HydratedDocument<T> | FlattenMaps<T> | null> {
    const doc = this.model.findOneAndUpdate(filter, update, options);
    if (options?.lean) {
      doc.lean() as FlattenMaps<T>;
    }
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions);
    }
    return doc;
  }
  findOneAndDelete({
    filter,
    options = { new: true },
  }: {
    filter: QueryFilter<T>;
    options?: QueryOptions<T> | null;
  }): Promise<HydratedDocument<T> | FlattenMaps<T> | null> {
    const doc = this.model.findOneAndDelete(filter, options);
    if (options?.lean) {
      doc.lean() as FlattenMaps<T>;
    }
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions);
    }
    return doc;
  }

  find({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.model.find(filter, projection, options);
  }
  async paginate({
    filter,
    projection,
    options,
    page = 1,
    limit = 10,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
    page?: number;
    limit?: number;
  }) {
    const docs = this.model.find(filter, projection, options);
    if (page) docs.skip((page - 1) * limit);
    if (limit) docs.limit(limit);
    if(options?.lean)
        docs.lean()

    const data = await docs.exec();
    const count = await this.model.countDocuments(filter)
    return {
        data,
        limit,
        currentPage:page,
        totalPages:Math.ceil(count/limit)
    }
  }
}
