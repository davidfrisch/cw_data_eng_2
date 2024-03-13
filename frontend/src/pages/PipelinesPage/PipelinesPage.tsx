import { useEffect, useState } from "react";
import api from "../../api";
import { Button, Card, Container, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Pipeline } from "./pipeline";



export default function PipelinesPage() {

  const [pipelines, setPipelines] = useState([]);
  const [filteredPipelines, setFilteredPipelines] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [numWaitingForRefresh, setNumWaitingForRefresh] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  async function getPipelines() {
    try {
      setIsLoading(true);
      const response = await api.pipelines.getAll();
      console.log(response.data);
      setPipelines(response.data);
      setFilteredPipelines(response.data)
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function getWaitingForRefresh() {
    try {
      const response = await api.pipelines.getWaitingForRefresh();
      setNumWaitingForRefresh(response.data.length);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getPipelines();
    getWaitingForRefresh();
  }, []);

  const handleView = (id: string) => {
    navigate(`/pipelines/${id}`);
  }

  const handleFilter = (status: string) => {
    const filteredPipelines = pipelines.filter((pipeline: Pipeline) => pipeline?.status && pipeline?.status?.toLowerCase() === status.toLowerCase());
    console.log(filteredPipelines);
    setFilteredPipelines(filteredPipelines);
  }

  const handleStartProcessing = async () => {
    try {
      await api.pipelines.startProcessing();
      getWaitingForRefresh();
      setOpenSnackbar(true);
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <Container>
      <h1>Pipelines</h1>
      {numWaitingForRefresh > 0 && <div style={{ marginBottom: "20px" }}>
        <Button variant="contained" color="success" onClick={handleStartProcessing}>
          Start processing ({numWaitingForRefresh}) files
        </Button>
      </div>}
      <Container sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button sx={{ marginRight: "14px" }} variant="contained" color="primary" onClick={() => setFilteredPipelines(pipelines)}>ALL</Button>
        <Button sx={{ marginRight: "14px" }} variant="contained" color="primary" onClick={() => handleFilter("running")}>RUNNING</Button>
        <Button sx={{ marginRight: "14px" }} variant="contained" color="primary" onClick={() => handleFilter("completed")}>COMPLETED</Button>
        <Button variant="contained" color="primary" onClick={() => handleFilter("failed")}>FAILED</Button>
      </Container>
      {isLoading && <p>Loading...</p>}

      {!isLoading && filteredPipelines.length === 0 && <div>
        <h2>No Pipelines Found</h2>


        <p>Create a new pipeline by clicking the button "Add file" and drag and drop the file</p>
      </div>}

      <div style={{ display: "flex", flexWrap: "wrap", overflowY: "auto", height: "calc(100vh - 150px)" }}>
        {filteredPipelines.map((pipeline: Pipeline) => (
          <Card elevation={3} sx={{ padding: "20px", margin: "20px", width: "calc(50% - 40px)" }}>
            <h2>Pipeline ID: {pipeline.flow_run_id}</h2>
            <p>Status: {pipeline.status}</p>
            <p>Date Added: {pipeline.date_added ? new Date(pipeline.date_added).toLocaleString() : ""}</p>
            <p>Date Updated: {new Date(pipeline.date_updated).toLocaleString()}</p>
            <Button variant="contained" color="primary" onClick={() => handleView(pipeline.flow_run_id)}>
              View
            </Button>
          </Card>
        ))}
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        color="success"
        onClose={() => setOpenSnackbar(false)}
        message="Processing started"
      />
    </Container>
  )
}