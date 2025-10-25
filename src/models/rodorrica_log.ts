export interface RodorricaLog {
  ID?: number;
  NOME_TABELA: string;
  TIPO_OPERACAO: string;
  DATA_OPERACAO?: Date;
  EMP_CODIGO: string;
  SERIE?: string;
  CODIGO: number;
  DATA_REPLICACAO?: Date;
  REPLICADO: string;
}
