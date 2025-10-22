import { Router, Request, Response } from 'express';
import { CNHService } from '../services/cnh.service';

const router = Router();

// GET /cnh?limit=20&offset=0&sortBy=CTRC&sortOrder=DESC
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = req.query.sortOrder as string | undefined;
    const data = await CNHService.getAll(limit, offset, sortBy, sortOrder);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar CNH', details: err });
  }
});

// GET /cnh/:emp_codigo/:serie/:ctrc
router.get('/:emp_codigo/:serie/:ctrc', async (req: Request, res: Response) => {
  try {
    const { emp_codigo, serie, ctrc } = req.params;
    const data = await CNHService.getById(emp_codigo, serie, parseInt(ctrc));
    if (!data) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar CNH', details: err });
  }
});

// GET /cnh/empcod/d?limit=20&offset=0&sortBy=CTRC&sortOrder=DESC
router.get('/empcod/d', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = req.query.sortOrder as string | undefined;
    const data = await CNHService.getByEmpCodigoD(limit, offset, sortBy, sortOrder);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar CNH com EMP_CODIGO LIKE D%', details: err });
  }
});

export default router;
