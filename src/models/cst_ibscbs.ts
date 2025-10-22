export interface CST_IBSCBS {
  ID?: number;
  CODIGO: string;
  DESCRICAO: string;
  TRIBUTACAO_REGULAR: boolean;
  REDUCAO_BC_CST: boolean;
  REDUCAO_ALIQUOTA: boolean;
  TRANSFERENCIA_CREDITO: boolean;
  DIFERIMENTO: boolean;
  MONOFASICA: boolean;
  CREDITO_PRESUMIDO_IBS_ZFM: boolean;
  AJUSTE_COMPETENCIA: boolean;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}
