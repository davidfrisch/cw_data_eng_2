import express from "express";
import PipelinesController from "../controllers/pipelines";
import multer from "multer";
import { SHARE_DIR } from "../constants";

export const pipelinesRouter = express.Router();

const storage = multer.diskStorage({
  destination(req: any, file: any, cb: any) {
    // directory to save the audio
    cb(null, SHARE_DIR);
    const filename = file.originalname;
    const audio_path =  `${SHARE_DIR}/${filename}`;
    req.body = { ...req.body, audio_path };
  },
  filename(req: any, file: any, cb: any) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

pipelinesRouter.get("/", PipelinesController.getPipelines);
pipelinesRouter.get("/refresh", PipelinesController.refreshPipelines);
pipelinesRouter.get("/:id", PipelinesController.getPipeline);
pipelinesRouter.get("/:id/audio", PipelinesController.getPipelineAudio);