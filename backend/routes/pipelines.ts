import express from "express";
import PipelinesController from "../controllers/pipelines";


export const pipelinesRouter = express.Router();

pipelinesRouter.get("/", PipelinesController.getPipelines);
pipelinesRouter.get("/:id", PipelinesController.getPipeline);
pipelinesRouter.get("/:id/audio", PipelinesController.getPipelineAudio);
pipelinesRouter.post("/add", PipelinesController.add);