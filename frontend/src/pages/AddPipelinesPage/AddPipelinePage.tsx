import { FileUploader } from "react-drag-drop-files"
import { useState } from 'react'
import api from "../../api";
import { PREFECT_UI_URL } from "../../constants";
import { CircularProgress } from "@mui/material";


export default function AddPipelinePage() {

  const [file, setFile] = useState<any>(null);
  const fileTypes = ["mp3", "wav"];
  const [pipeline, setPipeline] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (file: any) => {
    setFile(file);
  };

  const handleUpload = async () => {
    setSubmitted(true);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', file);
    const response = await api.pipelines.create(formData);
    const newPipeline = response.data;
    setPipeline(newPipeline);
    setIsLoading(false);
  }


  const handleVisitPrefectPipeline = () => {
    const url = `${PREFECT_UI_URL}/flow-runs/flow-run${pipeline.flow_run_id}`;
    window.open(url, '_blank');
  }

  return (
    <div>

      <div>
        Add Pipeline
      </div>

      <div>
        {!file ? (
          <FileUploader
            multiple={false}
            handleChange={handleChange}
            name="file"
            types={fileTypes}
          />
        ) : (
          <div>
            <div>{file.name}</div>
            <button hidden={submitted} onClick={handleUpload}>Add Audio</button>
            {isLoading && <CircularProgress hidden={!isLoading} />}
            <div hidden={!submitted || isLoading}>
              <div>Audio uploaded!</div>
              <button onClick={handleVisitPrefectPipeline}>Visit Prefect Pipeline</button>
            </div>
          </div>
        )}




      </div>
    </div>
  )
}