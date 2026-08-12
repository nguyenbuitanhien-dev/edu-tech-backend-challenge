import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => {
          const pathArray = err.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params');
          const field = pathArray.join('.') || 'input';
          return {
            field,
            reason: err.message,
          };
        });

        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details,
          },
        });
      }
      next(error);
    }
  };
}
