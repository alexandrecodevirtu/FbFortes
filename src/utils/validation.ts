import Joi from 'joi';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
  sortBy: Joi.string(),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

export const createRodorricaLogSchema = Joi.object({
  NOME_TABELA: Joi.string().max(50).required(),
  TIPO_OPERACAO: Joi.string().valid('I', 'U', 'D').required(),
  EMP_CODIGO: Joi.string().max(3).required(),
  SERIE: Joi.string().max(1).allow(null, ''),
  CODIGO: Joi.number().integer().required(),
  REPLICADO: Joi.string().valid('S', 'N').default('N'),
});

export const updateRodorricaLogSchema = Joi.object({
  NOME_TABELA: Joi.string().max(50),
  TIPO_OPERACAO: Joi.string().valid('I', 'U', 'D'),
  EMP_CODIGO: Joi.string().max(3),
  SERIE: Joi.string().max(1).allow(null, ''),
  CODIGO: Joi.number().integer(),
  DATA_REPLICACAO: Joi.date(),
  REPLICADO: Joi.string().valid('S', 'N'),
}).min(1);

export const createDiariaSchema = Joi.object({
  empCodigo: Joi.string().max(3).required(),
  cte: Joi.number().integer().required(),
  serie: Joi.string().max(1).allow(null),
  cteComplementar: Joi.number().integer().allow(null),
  motoristaId: Joi.number().integer().allow(null),
  prontuario: Joi.string().max(10).required(),
  nomeMotorista: Joi.string().max(40).required(),
  dt: Joi.string().max(10).allow(null),
  dataEmissao: Joi.string().pattern(isoDatePattern).required(),
  dataEntrega: Joi.string().pattern(isoDatePattern).required(),
  qtdeDiaria: Joi.number().integer().min(0).required(),
  valorDiaria: Joi.number().precision(2).required(),
  totalDiaria: Joi.number().precision(2).required(),
  dataBaixa: Joi.string().pattern(isoDatePattern).allow(null),
  baixado: Joi.boolean().default(false),
  usuario: Joi.string().max(15).allow(null),
  supervisor: Joi.string().max(15).allow(null),
});

export const updateDiariaSchema = Joi.object({
  empCodigo: Joi.string().max(3),
  cte: Joi.number().integer(),
  serie: Joi.string().max(1).allow(null),
  cteComplementar: Joi.number().integer().allow(null),
  motoristaId: Joi.number().integer().allow(null),
  prontuario: Joi.string().max(10),
  nomeMotorista: Joi.string().max(40),
  dt: Joi.string().max(10).allow(null),
  dataEmissao: Joi.string().pattern(isoDatePattern),
  dataEntrega: Joi.string().pattern(isoDatePattern),
  qtdeDiaria: Joi.number().integer().min(0),
  valorDiaria: Joi.number().precision(2),
  totalDiaria: Joi.number().precision(2),
  dataBaixa: Joi.string().pattern(isoDatePattern).allow(null),
  baixado: Joi.boolean(),
  usuario: Joi.string().max(15).allow(null),
  supervisor: Joi.string().max(15).allow(null),
  excluidoEm: Joi.string().isoDate().allow(null),
}).min(1);

export const diariaListQuerySchema = paginationSchema.keys({
  empCodigo: Joi.string().max(3),
  motoristaId: Joi.number().integer(),
  baixado: Joi.boolean(),
  dataInicio: Joi.string().pattern(isoDatePattern),
  dataFim: Joi.string().pattern(isoDatePattern),
});

export const createDiariaRecebimentoSchema = Joi.object({
  diariaId: Joi.number().integer().required(),
  dataRecebimento: Joi.string().pattern(isoDatePattern).required(),
  qtdeDiaria: Joi.number().integer().min(0).allow(null),
  valorDiaria: Joi.number().precision(2).allow(null),
  totalDiaria: Joi.number().precision(2).allow(null),
  observacao: Joi.string().max(255).allow(null),
  usuario: Joi.string().max(15).allow(null),
});

export const updateDiariaRecebimentoSchema = Joi.object({
  diariaId: Joi.number().integer(),
  dataRecebimento: Joi.string().pattern(isoDatePattern),
  qtdeDiaria: Joi.number().integer().min(0).allow(null),
  valorDiaria: Joi.number().precision(2).allow(null),
  totalDiaria: Joi.number().precision(2).allow(null),
  observacao: Joi.string().max(255).allow(null),
  usuario: Joi.string().max(15).allow(null),
}).min(1);

export const diariaRecebimentoListQuerySchema = paginationSchema.keys({
  diariaId: Joi.number().integer(),
});
