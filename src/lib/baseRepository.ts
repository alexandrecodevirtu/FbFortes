import {
  Insertable,
  Kysely,
  SelectQueryBuilder,
  Selectable,
  Updateable,
  sql,
} from 'kysely';
import { Database, getPostgresDb } from '../db/postgres';

export type OrderByClause<TableName extends keyof Database> = {
  column: keyof Database[TableName];
  direction?: 'asc' | 'desc';
};

export abstract class BaseRepository<
  TableName extends keyof Database,
  Filters = Record<string, never>
> {
  protected abstract table: TableName;
  protected abstract primaryKey: keyof Database[TableName];

  protected get db(): Kysely<Database> {
    return getPostgresDb();
  }

  protected applyFilters<Output>(
    qb: SelectQueryBuilder<Database, TableName, Output>,
    _filters: Filters
  ): SelectQueryBuilder<Database, TableName, Output> {
    return qb;
  }

  protected defaultOrder(): OrderByClause<TableName>[] {
    return [];
  }

  async findAll(
    params: { limit: number; offset: number; filters: Filters }
  ): Promise<{ items: Selectable<Database[TableName]>[]; total: number; limit: number; offset: number }> {
    const { limit, offset, filters } = params;

    const baseSelect = this.db
      .selectFrom(this.table as any)
      .selectAll() as unknown as SelectQueryBuilder<
      Database,
      TableName,
      Selectable<Database[TableName]>
    >;

    let query = this.applyFilters(baseSelect, filters) as SelectQueryBuilder<
      Database,
      TableName,
      Selectable<Database[TableName]>
    >;

    for (const order of this.defaultOrder()) {
      query = query.orderBy(order.column as any, (order.direction ?? 'asc') as any);
    }

    const items = (await query.limit(limit).offset(offset).execute()) as unknown as Selectable<
      Database[TableName]
    >[];

    const baseCount = this.db
      .selectFrom(this.table as any) as unknown as SelectQueryBuilder<Database, TableName, Record<string, never>>;

    const countQuery = this.applyFilters(baseCount, filters) as SelectQueryBuilder<
      Database,
      TableName,
      Record<string, never>
    >;

    const countResult = (await countQuery
      .select(sql<number>`count(*)`.as('count'))
      .executeTakeFirst()) as unknown as { count: number | string | null | undefined };

    const total = countResult?.count ? Number(countResult.count) : 0;

    return { items, total, limit, offset };
  }

  async findById(id: number | string): Promise<Selectable<Database[TableName]> | undefined> {
    return (this.db
      .selectFrom(this.table)
      .selectAll()
      .where(this.primaryKey as any, '=', id)
      .executeTakeFirst()) as Promise<Selectable<Database[TableName]> | undefined>;
  }

  async create(
    data: Insertable<Database[TableName]>
  ): Promise<Selectable<Database[TableName]>> {
    return (this.db
      .insertInto(this.table)
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow()) as Selectable<Database[TableName]>;
  }

  async update(
    id: number | string,
    data: Updateable<Database[TableName]>
  ): Promise<Selectable<Database[TableName]> | undefined> {
    return (this.db
      .updateTable(this.table)
      .set(data as any)
      .where(this.primaryKey as any, '=', id)
      .returningAll()
      .executeTakeFirst()) as Promise<Selectable<Database[TableName]> | undefined>;
  }

  async delete(
    id: number | string
  ): Promise<Selectable<Database[TableName]> | undefined> {
    return (this.db
      .deleteFrom(this.table)
      .where(this.primaryKey as any, '=', id)
      .returningAll()
      .executeTakeFirst()) as Promise<Selectable<Database[TableName]> | undefined>;
  }
}
