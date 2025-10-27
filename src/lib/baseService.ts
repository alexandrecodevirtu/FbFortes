import { CustomError } from '../middleware/errorHandler';

export interface CrudRepositoryContract<Row, Filters, CreateDb, UpdateDb> {
  findAll(params: {
    limit: number;
    offset: number;
    filters: Filters;
  }): Promise<{ items: Row[]; total: number; limit: number; offset: number }>;
  findById(id: number | string): Promise<Row | undefined>;
  create(data: CreateDb): Promise<Row>;
  update(id: number | string, data: UpdateDb): Promise<Row | undefined>;
  delete(id: number | string): Promise<Row | undefined>;
}

export abstract class BaseCrudService<
  Row,
  Domain,
  Filters,
  CreateInput,
  UpdateInput,
  CreateDb,
  UpdateDb
> {
  protected constructor(
    protected readonly repository: CrudRepositoryContract<Row, Filters, CreateDb, UpdateDb>
  ) {}

  protected abstract toDomain(row: Row): Domain;
  protected abstract toCreateDb(data: CreateInput): CreateDb;
  protected abstract toUpdateDb(data: UpdateInput): UpdateDb;
  protected abstract notFoundMessage(id: number | string): string;
  protected deleteSuccessMessage(): string {
    return 'Registro removido com sucesso';
  }

  async list(params: {
    limit: number;
    offset: number;
    filters: Filters;
  }): Promise<{ data: Domain[]; total: number; limit: number; offset: number }> {
    const { items, total, limit, offset } = await this.repository.findAll(params);
    return {
      data: items.map((item) => this.toDomain(item)),
      total,
      limit,
      offset,
    };
  }

  async getById(id: number): Promise<Domain> {
    const record = await this.repository.findById(id);
    if (!record) {
      this.throwNotFound(id);
    }
    return this.toDomain(record as Row);
  }

  async create(data: CreateInput): Promise<Domain> {
    const created = await this.repository.create(this.toCreateDb(data));
    return this.toDomain(created);
  }

  async update(id: number, data: UpdateInput): Promise<Domain> {
    const updated = await this.repository.update(id, this.toUpdateDb(data));
    if (!updated) {
      this.throwNotFound(id);
    }
    return this.toDomain(updated as Row);
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      this.throwNotFound(id);
    }
    return {
      success: true,
      message: this.deleteSuccessMessage(),
    };
  }

  protected throwNotFound(id: number | string): never {
    const error: CustomError = new Error(this.notFoundMessage(id));
    error.statusCode = 404;
    throw error;
  }
}
