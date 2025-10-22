import { Router, Request, Response } from 'express';
import { CclasstribService } from '../services/cclasstrib.service';
import { createCclasstribSchema, updateCclasstribSchema, paginationSchema } from '../utils/validation';
import { asyncHandler, validateRequest } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /cclasstrib - Listar todos os registros com paginação
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = paginationSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { limit, offset, sortBy, sortOrder } = value;
  const result = await CclasstribService.getAllWithPagination(limit, offset, sortBy, sortOrder);
  res.json(result);
}));

/**
 * GET /cclasstrib/search/codigo/:codigo - Buscar por CODIGO (pesquisa exata)
 */
router.get('/search/codigo/:codigo', asyncHandler(async (req: Request, res: Response) => {
  const { codigo } = req.params;
  const record = await CclasstribService.getByCodigo(codigo);
  res.json(record);
}));

/**
 * GET /cclasstrib/search/descricao/:descricao - Buscar por DESCRICAO (pesquisa por aproximação)
 */
router.get('/search/descricao/:descricao', asyncHandler(async (req: Request, res: Response) => {
  const { descricao } = req.params;
  const records = await CclasstribService.getByDescricao(descricao);
  res.json(records);
}));

/**
 * GET /cclasstrib/search/cst/:cst_ibscbs_id - Buscar por CST_IBSCBS_ID
 */
router.get('/search/cst/:cst_ibscbs_id', asyncHandler(async (req: Request, res: Response) => {
  const { cst_ibscbs_id } = req.params;
  const records = await CclasstribService.getByCstIbscbsId(parseInt(cst_ibscbs_id));
  res.json(records);
}));

/**
 * GET /cclasstrib/:id - Buscar um registro pelo ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await CclasstribService.getById(parseInt(id));
  res.json(record);
}));

/**
 * POST /cclasstrib - Criar novo registro
 */
router.post('/', validateRequest(createCclasstribSchema), asyncHandler(async (req: Request, res: Response) => {
  const record = await CclasstribService.create(req.body);
  res.status(201).json(record);
}));

/**
 * PUT /cclasstrib/:id - Atualizar um registro
 */
router.put('/:id', validateRequest(updateCclasstribSchema), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await CclasstribService.update(parseInt(id), req.body);
  res.json(record);
}));

/**
 * DELETE /cclasstrib/:id - Deletar um registro
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CclasstribService.delete(parseInt(id));
  res.json(result);
}));

export default router;
