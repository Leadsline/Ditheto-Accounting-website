import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import storageRouter from "./storage";
import teamRouter from "./team";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(storageRouter);
router.use(teamRouter);
router.use(contactRouter);

export default router;
