import { useEffect, useState } from "react";
import api from "../../api";
import { Button, Card, Container, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Pipeline } from "./pipeline";

const failedStatus = ["failed", "crashed", "timedout"]
const completedStatus = ["completed"]
const runningStatus = ["running", "retrying"]
const scheduledStatus = ["scheduled", "late", "resuming", "awaitingretry", "pending", "paused"]

export default function PipelinesPage() {

  const [pipelines, setPipelines] = useState([]);
  const [filteredPipelines, setFilteredPipelines] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [numWaitingForRefresh, setNumWaitingForRefresh] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("all" as string);
  const [countPipelinesStatus, setCountPipelinesStatus] = useState({} as any);
  const navigate = useNavigate();

  async function getPipelines() {
    try {
      setIsLoading(true);
      const response = await api.pipelines.getAll();
      setPipelines(response.data);
      setFilteredPipelines(response.data)
      const countPipelinesStatus = response.data.reduce((acc: any, pipeline: Pipeline) => {
        if (pipeline?.status) {
          acc[pipeline.status.toLowerCase()] = acc[pipeline.status.toLowerCase()] ? acc[pipeline.status.toLowerCase()] + 1 : 1;
        } 
        
        acc["all"] = acc["all"] ? acc["all"] + 1 : 1;
        
        return acc;
      }, {});
      setCountPipelinesStatus(countPipelinesStatus);
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

  const handleFilter = (status: string[]) => {
    setCurrentStatus(status[0]);
    if (status[0] === "all") {
      setFilteredPipelines(pipelines);
      return;
    }

    const filteredPipelines = pipelines.filter((pipeline: Pipeline) => pipeline?.status && status.includes(pipeline.status.toLowerCase()));
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

  const handleDownloadPipelines = async () => {
    try {
      const response = await api.pipelines.download(null, currentStatus)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      link.setAttribute("download", `pipelines-${currentStatus}-${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
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
      <Container>
        <Container sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button sx={{ marginRight: "14px" }} variant="contained" color={currentStatus === "all" ? "secondary" : "primary"} onClick={() => handleFilter(["all"])}>ALL {countPipelinesStatus["all"] && "("+countPipelinesStatus["all"]+")"}</Button>
          <Button sx={{ marginRight: "14px" }} variant="contained" color={currentStatus === "scheduled" ? "secondary" : "primary"} onClick={() => handleFilter(scheduledStatus)}>SCHEDULED {countPipelinesStatus["scheduled"] && "("+countPipelinesStatus["scheduled"]+")"}</Button>
          <Button sx={{ marginRight: "14px" }} variant="contained" color={currentStatus === "running" ? "secondary" : "primary"} onClick={() => handleFilter(runningStatus)}>RUNNING {countPipelinesStatus["running"] && "("+countPipelinesStatus["running"]+")"}</Button>
          <Button sx={{ marginRight: "14px" }} variant="contained" color={currentStatus === "completed" ? "secondary" : "primary"} onClick={() => handleFilter(completedStatus)}>COMPLETED {countPipelinesStatus["completed"] && "("+countPipelinesStatus["completed"]+")"}</Button>
          <Button variant="contained" color={currentStatus === "failed" ? "secondary" : "primary"} onClick={() => handleFilter(failedStatus)}>FAILED</Button>
        </Container>
        <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={handleDownloadPipelines}>
            Download Pipelines ({filteredPipelines.length})
          </Button>
        </Container>
      </Container>
      {isLoading && <p>Loading...</p>}

      {!isLoading && filteredPipelines.length === 0 && <div>
        <h2>No Pipelines Found</h2>

        {currentStatus === "running" && <p>There are no running pipelines</p>}
        {currentStatus === "completed" && <p>There are no completed pipelines</p>}
        {currentStatus === "failed" && <p>There are no failed pipelines</p>}
        {currentStatus === "all" && <p>Create a new pipeline by clicking the button "Add file" and drag and drop the file</p>}
      </div>}

      <div style={{ display: "flex", flexWrap: "wrap", overflowY: "auto", height: "calc(100vh - 150px)" }}>
        {filteredPipelines.map((pipeline: Pipeline) => (
          <Card key={pipeline.flow_run_id} elevation={3} sx={{ padding: "20px", margin: "20px", width: "calc(50% - 40px)", height: "330px" }}>
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