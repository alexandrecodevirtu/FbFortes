import { Router, Request, Response } from 'express';
import { RodorricaLogService } from '../services/rodorrica_log.service';
import { createRodorricaLogSchema, updateRodorricaLogSchema, paginationSchema } from '../utils/validation';
import { asyncHandler, validateRequest } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /rodorrica_log - Listar todos os registros com paginação
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { limit, offset, sortBy, sortOrder } = value;
  const result = await RodorricaLogService.getAllWithPagination(limit, offset, sortBy, sortOrder);
  res.json(result);
}));

/**
 * GET /rodorrica_log/search/tabela/:nomeTabela - Buscar por NOME_TABELA
 */
router.get('/search/tabela/:nomeTabela', asyncHandler(async (req: Request, res: Response) => {
  const { nomeTabela } = req.params;
  const records = await RodorricaLogService.getByNomeTabela(nomeTabela);
  res.json(records);
}));

/**
 * GET /rodorrica_log/search/empresa/:empCodigo - Buscar por EMP_CODIGO
 */
router.get('/search/empresa/:empCodigo', asyncHandler(async (req: Request, res: Response) => {
  const { empCodigo } = req.params;
  const records = await RodorricaLogService.getByEmpCodigo(empCodigo);
  res.json(records);
}));

/**
 * GET /rodorrica_log/search/replicado/:replicado - Buscar por status de replicação (S ou N)
 */
router.get('/search/replicado/:replicado', asyncHandler(async (req: Request, res: Response) => {
  const { replicado } = req.params;
  const records = await RodorricaLogService.getByReplicado(replicado);
  res.json(records);
}));

/**
 * GET /rodorrica_log/:id - Buscar um registro pelo ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await RodorricaLogService.getById(parseInt(id));
  res.json(record);
}));

/**
 * POST /rodorrica_log - Criar novo registro
 */
router.post('/', validateRequest(createRodorricaLogSchema), asyncHandler(async (req: Request, res: Response) => {
  const record = await RodorricaLogService.create(req.body);
  res.status(201).json(record);
}));

/**
 * PUT /rodorrica_log/:id - Atualizar um registro
 */
router.put('/:id', validateRequest(updateRodorricaLogSchema), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await RodorricaLogService.update(parseInt(id), req.body);
  res.json(record);
}));

/**
 * PATCH /rodorrica_log/:id/replicado - Marcar um registro como replicado
 */
router.patch('/:id/replicado', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await RodorricaLogService.markAsReplicado(parseInt(id));
  res.json(record);
}));

/**
 * PATCH /rodorrica_log/bulk/replicado - Marcar múltiplos registros como replicados
 */
router.patch('/bulk/replicado', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'É necessário fornecer um array de IDs' });
  }
  const result = await RodorricaLogService.markMultipleAsReplicado(ids);
  res.json(result);
}));

/**
 * DELETE /rodorrica_log/:id - Deletar um registro
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RodorricaLogService.delete(parseInt(id));
  res.json(result);
}));

export default router;
