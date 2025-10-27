import { Insertable, Selectable, Updateable } from 'kysely';
import {
  DiariaRecebimentoFilters,
  DiariaRecebimentoRepository,
} from '../repositories/diaria_recebimento.repository';
import { DiariaRecebimentoTable } from '../db/postgres';
import {
  CreateDiariaRecebimentoInput,
  DiariaRecebimento,
  UpdateDiariaRecebimentoInput,
} from '../models/diaria_recebimento';
import { DiariaRepository } from '../repositories/diaria.repository';
import { BaseCrudService } from '../lib/baseService';
import { CustomError } from '../middleware/errorHandler';

function numericToNumber(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapRowToModel(row: Selectable<DiariaRecebimentoTable>): DiariaRecebimento {
  return {
    id: row.id,
    diariaId: row.diaria_id,
    dataRecebimento: row.data_recebimento,
    qtdeDiaria: row.qtde_diaria ?? null,
    valorDiaria: numericToNumber(row.valor_diaria),
    totalDiaria: numericToNumber(row.total_diaria),
    criadoEm: row.criado_em ? row.criado_em.toISOString() : null,
    observacao: row.observacao,
    usuario: row.usuario,
  };
}

function mapCreateInputToDb(
  data: CreateDiariaRecebimentoInput
): Insertable<DiariaRecebimentoTable> {
  return {
    diaria_id: data.diariaId,
    data_recebimento: data.dataRecebimento,
    qtde_diaria: data.qtdeDiaria ?? null,
    valor_diaria: data.valorDiaria ?? null,
    total_diaria: data.totalDiaria ?? null,
    observacao: data.observacao ?? null,
    usuario: data.usuario ?? null,
  };
}

function mapUpdateInputToDb(
  data: UpdateDiariaRecebimentoInput
): Updateable<DiariaRecebimentoTable> {
  const update: Updateable<DiariaRecebimentoTable> = {} as Updateable<DiariaRecebimentoTable>;

  if (data.diariaId !== undefined) update.diaria_id = data.diariaId;
  if (data.dataRecebimento !== undefined) {
    update.data_recebimento = data.dataRecebimento as Updateable<DiariaRecebimentoTable>['data_recebimento'];
  }
  if (data.qtdeDiaria !== undefined) update.qtde_diaria = data.qtdeDiaria ?? null;
  if (data.valorDiaria !== undefined) {
    update.valor_diaria = data.valorDiaria as Updateable<DiariaRecebimentoTable>['valor_diaria'];
  }
  if (data.totalDiaria !== undefined) {
    update.total_diaria = data.totalDiaria as Updateable<DiariaRecebimentoTable>['total_diaria'];
  }
  if (data.observacao !== undefined) update.observacao = data.observacao ?? null;
  if (data.usuario !== undefined) update.usuario = data.usuario ?? null;

  return update;
}

export class DiariaRecebimentoService extends BaseCrudService<
  Selectable<DiariaRecebimentoTable>,
  DiariaRecebimento,
  DiariaRecebimentoFilters,
  CreateDiariaRecebimentoInput,
  UpdateDiariaRecebimentoInput,
  Insertable<DiariaRecebimentoTable>,
  Updateable<DiariaRecebimentoTable>
> {
  constructor(
    private readonly repo = new DiariaRecebimentoRepository(),
    private readonly diariaRepo = new DiariaRepository()
  ) {
    super(repo);
  }

  protected toDomain(row: Selectable<DiariaRecebimentoTable>): DiariaRecebimento {
    return mapRowToModel(row);
  }

  protected toCreateDb(
    data: CreateDiariaRecebimentoInput
  ): Insertable<DiariaRecebimentoTable> {
    return mapCreateInputToDb(data);
  }

  protected toUpdateDb(
    data: UpdateDiariaRecebimentoInput
  ): Updateable<DiariaRecebimentoTable> {
    return mapUpdateInputToDb(data);
  }

  protected notFoundMessage(id: number | string): string {
    return `DiariaRecebimento com ID ${id} não encontrado`;
  }

  protected deleteSuccessMessage(): string {
    return 'Registro de recebimento removido com sucesso';
  }

  private async ensureDiariaExists(diariaId: number): Promise<void> {
    const diaria = await this.diariaRepo.findById(diariaId);
    if (!diaria) {
      const error: CustomError = new Error(`Diaria com ID ${diariaId} não encontrada`);
      error.statusCode = 404;
      throw error;
    }
  }

  async list(params: {
    limit: number;
    offset: number;
    filters: DiariaRecebimentoFilters;
  }): Promise<{ data: DiariaRecebimento[]; total: number; limit: number; offset: number }> {
    return super.list(params);
  }

  async create(data: CreateDiariaRecebimentoInput): Promise<DiariaRecebimento> {
    await this.ensureDiariaExists(data.diariaId);
    return super.create(data);
  }

  async update(
    id: number,
    data: UpdateDiariaRecebimentoInput
  ): Promise<DiariaRecebimento> {
    if (data.diariaId !== undefined) {
      await this.ensureDiariaExists(data.diariaId);
    }
    return super.update(id, data);
  }

  async getByDiariaId(diariaId: number): Promise<DiariaRecebimento[]> {
    await this.ensureDiariaExists(diariaId);
    const records = await this.repo.findByDiariaId(diariaId);
    return records.map((record) => this.toDomain(record));
  }
}

export const diariaRecebimentoService = new DiariaRecebimentoService();
