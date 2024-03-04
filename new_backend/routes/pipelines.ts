import express from "express";
import PipelinesController from "../controllers/pipelines";


export const pipelinesRouter = express.Router();

pipelinesRouter.get("/", PipelinesController.getPipelines);
pipelinesRouter.post("/add", PipelinesController.add);