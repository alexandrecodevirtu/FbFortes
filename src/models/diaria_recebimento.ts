export interface DiariaRecebimento {
  id: number;
  diariaId: number;
  dataRecebimento: string;
  qtdeDiaria: number | null;
  valorDiaria: number | null;
  totalDiaria: number | null;
  criadoEm: string | null;
  observacao: string | null;
  usuario: string | null;
}

export interface CreateDiariaRecebimentoInput {
  diariaId: number;
  dataRecebimento: string;
  qtdeDiaria?: number | null;
  valorDiaria?: number | null;
  totalDiaria?: number | null;
  observacao?: string | null;
  usuario?: string | null;
}

export type UpdateDiariaRecebimentoInput = Partial<CreateDiariaRecebimentoInput>;
