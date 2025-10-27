import { Router, Request, Response } from 'express';
import { asyncHandler, validateRequest } from '../middleware/errorHandler';
import {
  createDiariaRecebimentoSchema,
  diariaRecebimentoListQuerySchema,
  updateDiariaRecebimentoSchema,
} from '../utils/validation';
import { diariaRecebimentoService } from '../services/diaria_recebimento.service';

const router = Router();

function parseId(param: string): number | null {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = diariaRecebimentoListQuerySchema.validate(req.query, { convert: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const typedValue = value as {
      limit: number;
      offset: number;
      diariaId?: number;
    };

    const { limit, offset, diariaId } = typedValue;
    const result = await diariaRecebimentoService.list({
      limit,
      offset,
      filters: {
        diariaId,
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

  const record = await diariaRecebimentoService.getById(id);
    res.json(record);
  })
);

router.post('/', validateRequest(createDiariaRecebimentoSchema), asyncHandler(async (req: Request, res: Response) => {
  const created = await diariaRecebimentoService.create(req.body);
    res.status(201).json(created);
  })
);

router.put('/:id', validateRequest(updateDiariaRecebimentoSchema), asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

  const updated = await diariaRecebimentoService.update(id, req.body);
    res.json(updated);
  })
);

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

  const result = await diariaRecebimentoService.delete(id);
    res.json(result);
  })
);

export default router;
