import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import * as cargoService from '../services/cargo.service';

export const getAllCargo = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;

  const { items, meta } = await cargoService.getAllCargo({ limit, offset });
  res.json(ApiResponse.paginated(items, meta));
});
