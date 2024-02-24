import express, { Router } from "express";
import songRouter from "./api/songRoutes";

const indexRouter: Router = express.Router();

indexRouter.use("/songs", songRouter);

export default indexRouter;
