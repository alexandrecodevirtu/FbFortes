export interface Diaria {
  id: number;
  empCodigo: string;
  cte: number;
  serie: string | null;
  cteComplementar: number | null;
  motoristaId: number | null;
  prontuario: string;
  nomeMotorista: string;
  dt: string | null;
  dataEmissao: string;
  dataEntrega: string;
  qtdeDiaria: number;
  valorDiaria: number;
  totalDiaria: number;
  dataBaixa: string | null;
  baixado: boolean;
  criadoEm: string | null;
  excluidoEm: string | null;
  usuario: string | null;
  supervisor: string | null;
}

export interface CreateDiariaInput {
  empCodigo: string;
  cte: number;
  serie?: string | null;
  cteComplementar?: number | null;
  motoristaId?: number | null;
  prontuario: string;
  nomeMotorista: string;
  dt?: string | null;
  dataEmissao: string;
  dataEntrega: string;
  qtdeDiaria: number;
  valorDiaria: number;
  totalDiaria: number;
  dataBaixa?: string | null;
  baixado?: boolean;
  usuario?: string | null;
  supervisor?: string | null;
}

export interface UpdateDiariaInput extends Partial<CreateDiariaInput> {
  excluidoEm?: string | null;
}

export interface DiariaListFilters {
  empCodigo?: string;
  motoristaId?: number;
  baixado?: boolean;
  dataInicio?: string;
  dataFim?: string;
}
