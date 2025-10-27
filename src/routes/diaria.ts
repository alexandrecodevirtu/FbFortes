import { Router, Request, Response } from 'express';
import { diariaService } from '../services/diaria.service';
import { diariaRecebimentoService } from '../services/diaria_recebimento.service';
import {
  createDiariaSchema,
  diariaListQuerySchema,
  updateDiariaSchema,
} from '../utils/validation';
import { asyncHandler, validateRequest } from '../middleware/errorHandler';

const router = Router();

function parseId(param: string): number | null {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

router.get('/',  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = diariaListQuerySchema.validate(req.query, { convert: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const typedValue = value as {
      limit: number;
      offset: number;
      empCodigo?: string;
      motoristaId?: number;
      baixado?: boolean;
      dataInicio?: string;
      dataFim?: string;
    };

    const { limit, offset, empCodigo, motoristaId, baixado, dataInicio, dataFim } = typedValue;

    const result = await diariaService.list({
      limit,
      offset,
      filters: {
        empCodigo,
        motoristaId,
        baixado,
        dataInicio,
        dataFim,
      },
    });

    res.json(result);
  })
);

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

  const record = await diariaService.getById(id);
    res.json(record);
  })
);

router.get('/:id/recebimentos', asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

  const records = await diariaRecebimentoService.getByDiariaId(id);
    res.json(records);
  })
);

router.post('/', validateRequest(createDiariaSchema), asyncHandler(async (req: Request, res: Response) => {
  const created = await diariaService.create(req.body);
    res.status(201).json(created);
  })
);

router.put('/:id', validateRequest(updateDiariaSchema), asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

  const updated = await diariaService.update(id, req.body);
    res.json(updated);
  })
);

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

  const result = await diariaService.delete(id);
    res.json(result);
  })
);

export default router;
