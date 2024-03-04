import { Request, Response } from 'express';
import prefectClient from '../services/prefect_client';

class HealthController {
  public static async checkHealth(req: Request, res: Response): Promise<void> {

    const prefectHeatlh = await prefectClient.checkHealth();

    res.status(200).json({ 
      status : "ok",
      prefect: ""+prefectHeatlh,
    });
  }
}

export default HealthController;