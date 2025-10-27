import { SelectQueryBuilder, Selectable } from 'kysely';
import { Database, DiariaRecebimentoTable, getPostgresDb } from '../db/postgres';
import { BaseRepository } from '../lib/baseRepository';

export interface DiariaRecebimentoFilters {
  diariaId?: number;
}

export class DiariaRecebimentoRepository extends BaseRepository<
  'diaria_recebimento',
  DiariaRecebimentoFilters
> {
  protected table = 'diaria_recebimento' as const;
  protected primaryKey: keyof Database['diaria_recebimento'] = 'id';

  protected defaultOrder() {
    return [
      { column: 'data_recebimento' as const, direction: 'desc' as const },
      { column: 'id' as const, direction: 'desc' as const },
    ];
  }

  protected applyFilters<Output>(
    qb: SelectQueryBuilder<Database, 'diaria_recebimento', Output>,
    filters: DiariaRecebimentoFilters
  ): SelectQueryBuilder<Database, 'diaria_recebimento', Output> {
    let query = qb;

    if (filters.diariaId !== undefined) {
      query = query.where('diaria_id', '=', filters.diariaId);
    }

    return query;
  }

  async findByDiariaId(diariaId: number): Promise<Selectable<DiariaRecebimentoTable>[]> {
    return getPostgresDb()
      .selectFrom('diaria_recebimento')
      .selectAll()
      .where('diaria_id', '=', diariaId)
      .orderBy('data_recebimento', 'desc')
      .orderBy('id', 'desc')
      .execute();
  }
}
