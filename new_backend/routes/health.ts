import express from "express";
import HealthController from "../controllers/health";


export const HealthRouter = express.Router();

HealthRouter.get("/", HealthController.checkHealth);