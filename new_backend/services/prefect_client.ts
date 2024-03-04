import axios, { AxiosInstance } from 'axios';

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
      console.error(error);
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

const baseURL = 'http://ec2-35-178-107-122.eu-west-2.compute.amazonaws.com/api';
const client = new PrefectClient(baseURL);

export default client;