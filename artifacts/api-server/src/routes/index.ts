import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import petsRouter from "./pets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(petsRouter);

export default router;
