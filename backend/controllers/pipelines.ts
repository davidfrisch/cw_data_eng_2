import { Response, Request } from "express";
import prisma from "../services/prisma_client";
import prefectClient from "../services/prefect_client";
import fs from "fs";
import { audio_results } from "@prisma/client";
import { NEW_AUDIO_DIR, PIPELINES_AUDIO_DIR, SHARE_DIR } from "../constants";

class PipelinesController {

  public static async getPipelines(req: Request, res: Response): Promise<void> {
    let pipelines = await prisma.audio_results.findMany();

    if (!pipelines) {
      res.status(404).send("Pipelines not found");
    }

    const getHeadPipelines = pipelines.map(async (pipeline: audio_results) => {
      const flowRunInfo = await prefectClient.getFlowRunInfo(pipeline.flow_run_id);
      const { audio_path, flow_run_id, date_added, date_updated, vm_worker_id } = pipeline;
      return {
        'status': flowRunInfo['state_type'],
        flow_run_id,
        audio_path,
        date_added,
        date_updated,
        vm_worker_id,
      };
    })

    const headPipelines = await Promise.all(getHeadPipelines);
    res.status(200).json(headPipelines);
  }

  public static async getPipeline(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).send("Pipeline id is required");
      return;
    }

    const pipeline = await prisma.audio_results.findUnique({
      where: {
        flow_run_id: id,
      },
    });

    if (!pipeline) {
      res.status(404).send("Pipeline not found");
      return;
    }

    const flowRunInfo = await prefectClient.getFlowRunInfo(pipeline.flow_run_id);
    const pipelineInfo = {
      'status': flowRunInfo['state_type'],
      ...pipeline,
    };

    res.status(200).json(pipelineInfo);
  }

  public static async getPipelineAudio(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).send("Pipeline id is required");
      return;
    }

    const pipeline = await prisma.audio_results.findUnique({
      where: {
        flow_run_id: id,
      },
    });

    if (!pipeline) {
      console.error("Pipeline not found");
      res.status(404).send("Pipeline not found");
      return;
    }

    if (!pipeline.audio_path) {
      console.error(`No audio for this pipeline: ${id}`); // eslint-disable-line no-console
      console.error(pipeline.audio_path);
      res.status(404).send("No audio for this pipeline");
      return;
    }

    if (!fs.existsSync(pipeline.audio_path)) {
      console.error("Audio file not found");
      console.error(pipeline.audio_path);
      res.status(404).send("Audio file not found");
      return;
    }

    res.status(200).sendFile(pipeline.audio_path);
  }

  public static async refreshPipelines(req: Request, res: Response): Promise<void> {
    // Get all audio files in the share directory
    if (SHARE_DIR === undefined) {
      throw new Error("SHARE_DIR is not defined");
    }

    const new_audio_files = fs.readdirSync(NEW_AUDIO_DIR);
    const new_pipelines: audio_results[] = [];
    for (const audio_file of new_audio_files) {
      if (!audio_file.endsWith(".wav")) {
        continue;
      }

      const oldPath = `${NEW_AUDIO_DIR}/${audio_file}`;
      const timestamp = new Date().getTime();
      const newPath = `${PIPELINES_AUDIO_DIR}/${timestamp}-${audio_file}`;
      fs.renameSync(oldPath, newPath);

      try {
        const pipeline = await PipelinesController.start_pipeline(newPath);
        new_pipelines.push(pipeline);
      } catch (error) {
        console.error("Failed to start pipeline for audio: ", audio_file);
        console.error(error);
      }
    }

    res.status(200).send("Pipelines refreshed, new pipelines: " + new_pipelines.length);
  }


  private static async start_pipeline(audio_path: string): Promise<audio_results> {
    const pipeline_name = "pipeline-voice-analysis"

    console.log("Here is the audio path: ", audio_path);

    if (!audio_path) {
      throw new Error("Audio file is required");
    }

    if (!fs.existsSync(audio_path)) {
      throw new Error("Audio file not found");
    }

    const deploymentId = await prefectClient.getDeploymentIdByName(pipeline_name);
    const parameters = {
      audio_path,
    };

    const flowRun = await prefectClient.createFlowRun(deploymentId, parameters);

    if (!flowRun) {
      console.error("Failed to create flow run");
      throw new Error("Failed to create flow run");
    }
    const pipeline = await prisma.audio_results.create({
      data: {
        audio_path: audio_path,
        flow_run_id: flowRun.id,
      },
    });

    return pipeline;
  }

}

export default PipelinesController;



