import { Response, Request } from "express";
import prisma from "../services/prisma_client";
import prefectClient from "../services/prefect_client";
import fs from "fs";
import { Prisma, audio_results } from "@prisma/client";
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
      const status = flowRunInfo['state_type'];
      let conversationRate: any = null;
      if (status === "COMPLETED") {
        const avgConversationRate = await prisma.speakers.groupBy({ by: ['flow_run_id'], _avg: { conversation_rate: true } });
        conversationRate = avgConversationRate.find((avg: any) => avg.flow_run_id === flow_run_id)?._avg.conversation_rate
        conversationRate = isNaN(conversationRate) ? null : Math.round(conversationRate);
      }
      return {
        'status': flowRunInfo['state_type'],
        flow_run_id,
        audio_path,
        date_added,
        date_updated,
        vm_worker_id,
        conversationRate
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
    const emotions = await prisma.emotions_scores.findMany({ where: { flow_run_id: id } });
    const emotionsPerSpeaker = emotions ? emotions.reduce((acc, emotion: any) => {
      if (!acc[emotion['speaker_id']]) {
        acc[emotion['speaker_id']] = [];
      }
      acc[emotion['speaker_id']].push(emotion);
      return acc;
    }
      , {} as any) : {};

    const speakers = await prisma.speakers.findMany({ where: { flow_run_id: id } });
    const conversation_rate = speakers ? speakers.reduce((acc, speaker) => {
      acc.push({ speaker_id: speaker['speaker_id'], conversation_rate: speaker['conversation_rate'] });
      return acc;
    }, [] as any) : {};


    const pipelineInfo = {
      'status': flowRunInfo['state_type'],
      emotions: emotionsPerSpeaker,
      conversation_rate,
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


  public static async pipelinesWaitingForRefresh(req: Request, res: Response): Promise<void> {
    const new_audio_files = fs.readdirSync(NEW_AUDIO_DIR);
    const files: string[] = [];
    for (const audio_file of new_audio_files) {
      if (!audio_file.endsWith(".wav") && !audio_file.endsWith(".mp3")) {
        continue;
      }
      files.push(audio_file);
    }

    res.status(200).json(files);
  }


  public static async refreshPipelines(req: Request, res: Response): Promise<void> {
    if (SHARE_DIR === undefined) {
      throw new Error("SHARE_DIR is not defined");
    }

    const new_audio_files = fs.readdirSync(NEW_AUDIO_DIR);
    const new_pipelines: audio_results[] = [];
    for (const audio_file of new_audio_files) {
      if (!audio_file.endsWith(".wav") && !audio_file.endsWith(".mp3")) {
        continue;
      }

      const oldPath = `${NEW_AUDIO_DIR}/${audio_file}`;
      const timestamp = new Date().getTime();
      const newPath = `${PIPELINES_AUDIO_DIR}/${timestamp}-${audio_file}`;
      fs.renameSync(oldPath, newPath);

      try {
        const pipeline = await PipelinesController.start_pipeline(newPath);
        if (!pipeline) {
          throw new Error("Failed to start pipeline");
        }
        new_pipelines.push(pipeline);
      } catch (error) {
        console.error("Failed to start pipeline for audio: ", audio_file);
        console.error(error);
        fs.renameSync(newPath, oldPath);
        res.status(500).send("Failed to start pipeline for audio: " + audio_file);
        return;
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

    const parameters = {
      audio_path,
    };

    let deploymentId: string | null = null;
    try {
      deploymentId = await prefectClient.getDeploymentIdByName(pipeline_name);
    } catch (error) {
      console.error("Failed to get deployment id");
      console.error(error);
    }

    try {
      if (!deploymentId) {
        console.error("Failed to get deployment id");
        throw new Error("Failed to get deployment id");
      }
      const flowRun = await prefectClient.createFlowRun(deploymentId, parameters);

      if (!flowRun) {
        console.error("Failed to create flow run");
        throw new Error("Failed to create flow run");
      }
      const pipeline = await prisma.audio_results.create({
        data: {
          audio_path: audio_path,
          flow_run_id: flowRun.id,
          date_added: new Date(),
        },
      });

      return pipeline;
    } catch (error) {
      console.error("Failed to start pipeline");
      console.error(error);
      throw new Error("Failed to start pipeline");
    }
  }

  public static async downloadPipelines(req: Request, res: Response): Promise<void> {
    const { ids, status } = req.query;



    // if id not provided then downaload all the pipelines

    const where: Prisma.audio_resultsWhereInput = {};
    if (ids) {
      where.flow_run_id = { in: ids.toString().split(",") };
    }

    const pipelines = await prisma.audio_results.findMany({ where });

    if (!pipelines) {
      res.status(404).send("Pipelines not found");
    }

    const pipelinesInfo = pipelines.map(async (pipeline: audio_results) => {
      const flowRunInfo = await prefectClient.getFlowRunInfo(pipeline.flow_run_id);
      const { audio_path, flow_run_id, date_added, date_updated, vm_worker_id } = pipeline;
      const currentStatusPipeline = flowRunInfo['state_type']?.toLowerCase();

      if (status && status?.toString().toLowerCase() !== currentStatusPipeline) {
        return null;
      }


      let conversationRate: any = null;
      if (currentStatusPipeline === "completed") {
        const avgConversationRate = await prisma.speakers.groupBy({ by: ['flow_run_id'], _avg: { conversation_rate: true } });
        conversationRate = avgConversationRate.find((avg: any) => avg.flow_run_id === flow_run_id)?._avg.conversation_rate
        conversationRate = isNaN(conversationRate) ? null : Math.round(conversationRate);
      }
      return {
        'status': flowRunInfo['state_type'],
        flow_run_id,
        audio_path,
        date_added,
        date_updated,
        vm_worker_id,
        conversationRate
      };
    }
    );

    let allPipelines = await Promise.all(pipelinesInfo);
    allPipelines = allPipelines.filter((pipeline: any) => pipeline !== null);

    // Write to a file and send the file to the user
    const timestamp = new Date().getTime();
    const filename = `pipelines-${timestamp}.json`;
    const filepath = `${SHARE_DIR}/${filename}`;
    try {
      fs.writeFileSync(filepath, JSON.stringify(allPipelines, null, 2));

      res.status(200).download(filepath, filename, () => {
        fs.unlinkSync(filepath as string);
      })
      return;
    } catch (error) {
      console.error("Failed to write pipelines to file");
      console.error(error);
      res.status(500).send("Failed to write pipelines to file");
      return;
    }


  }
}

export default PipelinesController;



