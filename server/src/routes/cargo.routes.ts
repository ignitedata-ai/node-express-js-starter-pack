import { Router } from 'express';
import { getAllCargo } from '../controllers/cargo.controller';

const router = Router();

router.get('/', getAllCargo);

export default router;
