import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { asyncHandler, validateRequest } from '../middleware/errorHandler';

export interface CrudServiceContract<Domain, Filters, CreateInput, UpdateInput> {
  list(params: { limit: number; offset: number; filters: Filters }): Promise<{
    data: Domain[];
    total: number;
    limit: number;
    offset: number;
  }>;
  getById(id: number): Promise<Domain>;
  create(data: CreateInput): Promise<Domain>;
  update(id: number, data: UpdateInput): Promise<Domain>;
  delete(id: number): Promise<{ success: boolean; message: string }>;
}

export interface CrudRouterOptions<Domain, Filters, CreateInput, UpdateInput> {
  service: CrudServiceContract<Domain, Filters, CreateInput, UpdateInput>;
  listSchema: Joi.ObjectSchema;
  createSchema: Joi.ObjectSchema;
  updateSchema: Joi.ObjectSchema;
  parseListQuery: (value: any) => { limit: number; offset: number; filters: Filters };
  extraRoutes?: (router: Router) => void;
}

function parseId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function createCrudRouter<Domain, Filters, CreateInput, UpdateInput>(
  options: CrudRouterOptions<Domain, Filters, CreateInput, UpdateInput>
): Router {
  const { service, listSchema, createSchema, updateSchema, parseListQuery, extraRoutes } = options;
  const router = Router();

  router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const { error, value } = listSchema.validate(req.query, { convert: true });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const listParams = parseListQuery(value);
      const result = await service.list(listParams);
      res.json(result);
    })
  );

  router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const record = await service.getById(id);
      res.json(record);
    })
  );

  router.post('/', validateRequest(createSchema), asyncHandler(async (req: Request, res: Response) => {
      const created = await service.create(req.body);
      res.status(201).json(created);
    })
  );

  router.put('/:id', validateRequest(updateSchema), asyncHandler(async (req: Request, res: Response) => {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const updated = await service.update(id, req.body);
      res.json(updated);
    })
  );

  router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const result = await service.delete(id);
      res.json(result);
    })
  );

  if (extraRoutes) {
    extraRoutes(router);
  }

  return router;
}
