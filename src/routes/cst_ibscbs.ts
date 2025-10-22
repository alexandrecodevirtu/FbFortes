import { Router, Request, Response } from 'express';
import { CstIbscbsService } from '../services/cst_ibscbs.service';
import { createCstIbscbsSchema, updateCstIbscbsSchema, paginationSchema } from '../utils/validation';
import { asyncHandler, validateRequest } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /cst_ibscbs - Listar todos os registros com paginação
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { limit, offset, sortBy, sortOrder } = value;
  const result = await CstIbscbsService.getAllWithPagination(limit, offset, sortBy, sortOrder);
  res.json(result);
}));

/**
 * GET /cst_ibscbs/search/codigo/:codigo - Buscar por CODIGO (pesquisa exata)
 */
router.get('/search/codigo/:codigo', asyncHandler(async (req: Request, res: Response) => {
  const { codigo } = req.params;
  const record = await CstIbscbsService.getByCodigo(codigo);
  res.json(record);
}));

/**
 * GET /cst_ibscbs/search/descricao/:descricao - Buscar por DESCRICAO (pesquisa por aproximação)
 */
router.get('/search/descricao/:descricao', asyncHandler(async (req: Request, res: Response) => {
  const { descricao } = req.params;
  const records = await CstIbscbsService.getByDescricao(descricao);
  res.json(records);
}));

/**
 * GET /cst_ibscbs/:id - Buscar um registro pelo ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await CstIbscbsService.getById(parseInt(id));
  res.json(record);
}));

/**
 * POST /cst_ibscbs - Criar novo registro
 */
router.post('/', validateRequest(createCstIbscbsSchema), asyncHandler(async (req: Request, res: Response) => {
  const record = await CstIbscbsService.create(req.body);
  res.status(201).json(record);
}));

/**
 * PUT /cst_ibscbs/:id - Atualizar um registro
 */
router.put('/:id', validateRequest(updateCstIbscbsSchema), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await CstIbscbsService.update(parseInt(id), req.body);
  res.json(record);
}));

/**
 * DELETE /cst_ibscbs/:id - Deletar um registro
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CstIbscbsService.delete(parseInt(id));
  res.json(result);
}));

export default router;
