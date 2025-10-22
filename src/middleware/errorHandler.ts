import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Middleware para tratamento centralizado de erros
 */
export function errorHandler(err: CustomError, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  logger.error(
    {
      statusCode,
      message,
      path: req.path,
      method: req.method,
      body: req.body,
      stack: err.stack,
    },
    'Erro na requisição'
  );

  res.status(statusCode).json({
    error: true,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Middleware para validação de entrada
 */
export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const customError: CustomError = new Error(error.details[0].message);
      customError.statusCode = 400;
      return next(customError);
    }

    req.body = value;
    next();
  };
}

/**
 * Wrapper para catch de erros assincronos
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
