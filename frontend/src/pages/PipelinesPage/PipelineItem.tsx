import { CardMedia, Paper } from '@mui/material'
import { useEffect, useState } from 'react'
import api from '../../api';
import { Pipeline } from './pipeline';
import { PREFECT_UI_URL } from '../../constants';



export default function PipelineItem() {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pipelineAudioFile, setPipelineAudioFile] = useState<any>(null);

  const getPipeline = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await api.pipelines.get(id);
      const pipeline = response.data;
      console.log(pipeline);
      setPipeline(pipeline);
      await getAudioFile(pipeline.flow_run_id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getAudioFile = async (id: string) => {
    try {
      setIsLoading(true);
      const audio = await api.pipelines.getAudio(id);
      const url = URL.createObjectURL(audio);
      setPipelineAudioFile(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const id = window.location.pathname.split("/")[2];
    getPipeline(id);
  }, []);

  if (isLoading) {
    return <p>Loading...</p>
  }

  const handleVisitPrefectPage = () => {
    window.open(`${PREFECT_UI_URL}/flow-runs/flow-run/${pipeline?.flow_run_id}`, "_blank");
  }

  return (
    <div>
      {!pipeline?.flow_run_id ? <p>No pipeline found</p> :
        <Paper elevation={3} style={{ padding: "20px", margin: "20px" }}>
          <h1>Pipeline</h1>
          <p>Flow Run ID: {pipeline.flow_run_id}</p>
          <p>Status: {pipeline.status || "No status found"}</p>
          <p>Date Added: {pipeline.date_added}</p>
          <p>Date Updated: {pipeline.date_updated}</p>
          <p>VM Worker ID: {pipeline.vm_worker_id}</p>
          
          {pipelineAudioFile ? (<CardMedia
            component="audio"
            controls
            src={pipelineAudioFile}
          />):
          (<p>No audio file found</p>)
          }

          <button onClick={handleVisitPrefectPage} disabled={!pipeline.status}>Visit Prefect UI</button>

          
        </Paper>
      }
    </div>
  )
}