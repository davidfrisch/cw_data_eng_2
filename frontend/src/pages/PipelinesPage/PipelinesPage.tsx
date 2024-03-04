import { useEffect, useState } from "react";
import api from "../../api";
import { Button, Card, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Pipeline } from "./pipeline";



export default function PipelinesPage() {

  const [pipelines, setPipelines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  async function getPipelines() {
    try {
      setIsLoading(true);
      const response = await api.pipelines.getAll();
      console.log(response.data);
      setPipelines(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPipelines();
  }, []);

  const handleView = (id: string) => {
    navigate(`/pipelines/${id}`);
  }



  return (
    <Container>
      <h1>Pipelines</h1>
      {isLoading && <p>Loading...</p>}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {pipelines.map((pipeline: Pipeline) => (
          <Card elevation={3} sx={{ padding: "20px", margin: "20px", width: "calc(50% - 40px)" }}>
            <h2>Pipeline ID: {pipeline.flow_run_id}</h2>
            <p>Status: {pipeline.status}</p>
            <p>Date Added: {pipeline.date_added}</p>
            <Button variant="contained" color="primary" onClick={() => handleView(pipeline.flow_run_id)}>
              View
            </Button>
          </Card>
        ))}
      </div>
    </Container>
  )
}