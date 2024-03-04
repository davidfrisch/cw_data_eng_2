import { Response, Request } from "express";
import prisma from "../services/prisma_client";
import prefectClient from "../services/prefect_client";
import fs from "fs";

class PipelinesController {

  public static async getPipelines(req: Request, res: Response): Promise<void> {
    let pipelines = await prisma.audio_results.findMany();

    if (!pipelines) {
      res.status(404).send("Pipelines not found");
    }

    for (const index in pipelines) {
      const flowRunInfo = await prefectClient.getFlowRunInfo(pipelines[index].flow_run_id);
      pipelines[index] = {
        ...pipelines[index],
        ...flowRunInfo
      }
      console.log(pipelines[index]);
    }


    res.status(200).json(pipelines);
  }

  public static async add(req: Request, res: Response): Promise<void> {
    const { audio_path, pipeline_name = "pipeline-voice-analysis" } = req.body;

    if (!audio_path) {
      res.status(400).send("Audio file is required");
      return;
    }

    // if (!fs.existsSync(audio_file)) {
    //   res.status(404).send("Audio file not found");
    //   return;
    // }

    const deploymentId = await prefectClient.getDeploymentIdByName(pipeline_name);
    const parameters = {
      audio_path,
    };

    const flowRun = await prefectClient.createFlowRun(deploymentId, parameters);

    if (!flowRun) {
      console.error("Failed to create flow run");
      res.status(500).send("Failed to create flow run");
      return;
    }
    const pipeline = await prisma.audio_results.create({
      data: {
        audio_path: audio_path,
        flow_run_id: flowRun.id,
      },
    });

    res.status(201).json(pipeline);
  }

}

export default PipelinesController;

