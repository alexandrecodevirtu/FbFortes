import { Insertable, Selectable, Updateable } from 'kysely';
import { DiariaRepository } from '../repositories/diaria.repository';
import { DiariaTable } from '../db/postgres';
import {
  CreateDiariaInput,
  Diaria,
  DiariaListFilters,
  UpdateDiariaInput,
} from '../models/diaria';
import { BaseCrudService } from '../lib/baseService';

function numericToNumber(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapRowToModel(row: Selectable<DiariaTable>): Diaria {
  return {
    id: row.id,
    empCodigo: row.emp_codigo,
    cte: row.cte,
    serie: row.serie,
    cteComplementar: row.cte_complementar,
    motoristaId: row.motorista_id,
    prontuario: row.prontuario,
    nomeMotorista: row.nome_motorista,
    dt: row.dt,
    dataEmissao: row.data_emissao,
    dataEntrega: row.data_entrega,
    qtdeDiaria: row.qtde_diaria,
    valorDiaria: numericToNumber(row.valor_diaria) ?? 0,
    totalDiaria: numericToNumber(row.total_diaria) ?? 0,
    dataBaixa: row.data_baixa,
    baixado: row.baixado,
    criadoEm: row.criado_em ? row.criado_em.toISOString() : null,
    excluidoEm: row.excluido_em ? row.excluido_em.toISOString() : null,
    usuario: row.usuario,
    supervisor: row.supervisor,
  };
}

function mapCreateInputToDb(data: CreateDiariaInput): Insertable<DiariaTable> {
  return {
    emp_codigo: data.empCodigo,
    cte: data.cte,
    serie: data.serie ?? null,
    cte_complementar: data.cteComplementar ?? null,
    motorista_id: data.motoristaId ?? null,
    prontuario: data.prontuario,
    nome_motorista: data.nomeMotorista,
    dt: data.dt ?? null,
    data_emissao: data.dataEmissao,
    data_entrega: data.dataEntrega,
    qtde_diaria: data.qtdeDiaria,
    valor_diaria: data.valorDiaria,
    total_diaria: data.totalDiaria,
    data_baixa: data.dataBaixa ?? null,
    baixado: data.baixado ?? false,
    usuario: data.usuario ?? null,
    supervisor: data.supervisor ?? null,
  };
}

function mapUpdateInputToDb(data: UpdateDiariaInput): Updateable<DiariaTable> {
  const update: Updateable<DiariaTable> = {} as Updateable<DiariaTable>;

  if (data.empCodigo !== undefined) update.emp_codigo = data.empCodigo;
  if (data.cte !== undefined) update.cte = data.cte;
  if (data.serie !== undefined) update.serie = data.serie ?? null;
  if (data.cteComplementar !== undefined) update.cte_complementar = data.cteComplementar ?? null;
  if (data.motoristaId !== undefined) update.motorista_id = data.motoristaId ?? null;
  if (data.prontuario !== undefined) update.prontuario = data.prontuario;
  if (data.nomeMotorista !== undefined) update.nome_motorista = data.nomeMotorista;
  if (data.dt !== undefined) update.dt = data.dt ?? null;
  if (data.dataEmissao !== undefined) {
    update.data_emissao = data.dataEmissao as Updateable<DiariaTable>['data_emissao'];
  }
  if (data.dataEntrega !== undefined) {
    update.data_entrega = data.dataEntrega as Updateable<DiariaTable>['data_entrega'];
  }
  if (data.qtdeDiaria !== undefined) update.qtde_diaria = data.qtdeDiaria;
  if (data.valorDiaria !== undefined) {
    update.valor_diaria = data.valorDiaria as Updateable<DiariaTable>['valor_diaria'];
  }
  if (data.totalDiaria !== undefined) {
    update.total_diaria = data.totalDiaria as Updateable<DiariaTable>['total_diaria'];
  }
  if (data.dataBaixa !== undefined) {
    const value = data.dataBaixa ?? null;
    update.data_baixa = value as Updateable<DiariaTable>['data_baixa'];
  }
  if (data.baixado !== undefined) {
    update.baixado = data.baixado as Updateable<DiariaTable>['baixado'];
  }
  if (data.usuario !== undefined) update.usuario = data.usuario ?? null;
  if (data.supervisor !== undefined) update.supervisor = data.supervisor ?? null;
  if (data.excluidoEm !== undefined) {
    const value = data.excluidoEm ? data.excluidoEm : null;
    update.excluido_em = value as Updateable<DiariaTable>['excluido_em'];
  }

  return update;
}

export class DiariaService extends BaseCrudService<
  Selectable<DiariaTable>,
  Diaria,
  DiariaListFilters,
  CreateDiariaInput,
  UpdateDiariaInput,
  Insertable<DiariaTable>,
  Updateable<DiariaTable>
> {
  constructor(private readonly repo = new DiariaRepository()) {
    super(repo);
  }

  protected toDomain(row: Selectable<DiariaTable>): Diaria {
    return mapRowToModel(row);
  }

  protected toCreateDb(data: CreateDiariaInput): Insertable<DiariaTable> {
    return mapCreateInputToDb(data);
  }

  protected toUpdateDb(data: UpdateDiariaInput): Updateable<DiariaTable> {
    return mapUpdateInputToDb(data);
  }

  protected notFoundMessage(id: number | string): string {
    return `Diaria com ID ${id} não encontrada`;
  }

  protected deleteSuccessMessage(): string {
    return 'Diaria removida com sucesso';
  }

}

export const diariaService = new DiariaService();
