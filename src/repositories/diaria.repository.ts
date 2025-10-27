import { SelectQueryBuilder } from 'kysely';
import { Database } from '../db/postgres';
import { DiariaListFilters } from '../models/diaria';
import { BaseRepository } from '../lib/baseRepository';

export class DiariaRepository extends BaseRepository<'diaria', DiariaListFilters> {
  protected table = 'diaria' as const;
  protected primaryKey: keyof Database['diaria'] = 'id';

  protected defaultOrder() {
    return [{ column: 'id' as const, direction: 'desc' as const }];
  }

  protected applyFilters<Output>(
    qb: SelectQueryBuilder<Database, 'diaria', Output>,
    filters: DiariaListFilters
  ): SelectQueryBuilder<Database, 'diaria', Output> {
    let query = qb;

    if (filters.empCodigo) {
      query = query.where('emp_codigo', '=', filters.empCodigo);
    }

    if (filters.motoristaId !== undefined) {
      query = query.where('motorista_id', '=', filters.motoristaId);
    }

    if (filters.baixado !== undefined) {
      query = query.where('baixado', '=', filters.baixado);
    }

    if (filters.dataInicio) {
      query = query.where('data_emissao', '>=', filters.dataInicio);
    }

    if (filters.dataFim) {
      query = query.where('data_emissao', '<=', filters.dataFim);
    }

    return query;
  }
}
