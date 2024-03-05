import axios from "axios";
import { BACKEND_URL } from "../constants";

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const pipelines = {
  async getAll() {
    return await api.get("/pipelines");
  },

  async create(data: any) {
    return await api.post("/pipelines/add-file", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async get(id: string) {
    return await api.get(`/pipelines/${id}`);
  },

  async getAudio(id: string) {
    const response = await api.get(`/pipelines/${id}/audio`, {
      responseType: "blob",
    });
    return response.data;
  }

}


const health = {
  async check() {
    try {
      const response = await api.get("/health");
      return response.data
    }
    catch (error) {
      console.error(error);
      return { server: "Offline" }
    }
  },
}

export default {
  pipelines,
  health,
}