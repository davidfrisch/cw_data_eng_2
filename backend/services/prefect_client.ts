import axios, { AxiosInstance } from 'axios';
import { PREFECT_API_URL } from '../constants';

class PrefectClient {
  private httpClient: AxiosInstance;

  constructor(baseURL: string) {
    this.httpClient = axios.create({
      baseURL,
      timeout: 5000, // Set your desired timeout value
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  public async createFlowRun(deploymentId: string, parameters: any): Promise<any> {
    const response = await this.httpClient.post(`/deployments/${deploymentId}/create_flow_run`, {
      parameters,
    });
    return response.data;
  }



  public async getFlowRunInfo(flowRunId: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/flow_runs/${flowRunId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting flow run info for flow run id: ", flowRunId);
      return { status: 'Failed' };
    }
  }

  public async getDeploymentIdByName(name: string): Promise<string> {
    const response = await this.httpClient.post('/deployments/filter');

    const deployments = response.data;
    const deployment = deployments.find((d: any) => d.name === name);

    if (!deployment) {
      throw new Error(`No deployment found with name ${name}`);
    }

    return deployment.id;
  }


}

// TODO: Update the baseURL with dynamic value
const client = new PrefectClient(PREFECT_API_URL);

export default client;