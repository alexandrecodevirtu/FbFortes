import Joi from 'joi';

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
