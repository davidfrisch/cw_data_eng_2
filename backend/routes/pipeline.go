package routes

import (
	"backend/external"
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type PipelineRequest struct {
	AudioPath string `json:"audio_path"`
}

type Pipeline struct {
	FlowRunId  string `json:"flow_run_id"`
	AudioPath  string `json:"audio_path"`
	VmWorkerId string `json:"vm_worker_id"`
	Status     string `json:"status"`
}

func addPipelineRoutes(rg *gin.RouterGroup) {
	pipeline := rg.Group("/pipelines")
	pipeline.GET("/", getPipelinesHandler)
	pipeline.POST("/new", AddPipelineHandler)
}

func getPipelinesHandler(c *gin.Context) {
	rows, err := external.DB.Query(context.Background(), "SELECT flow_run_id, audio_path FROM audio_results")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}
	defer rows.Close()

	var pipelines []Pipeline
	for rows.Next() {

		var pipeline Pipeline
		err := rows.Scan(&pipeline.FlowRunId, &pipeline.AudioPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
			return
		}

		flowRunInfo, err := external.GetFlowRunInfo(pipeline.FlowRunId)
		if err != nil {
			fmt.Println(err)
			pipeline.Status = "UNKNOWN"
		} else {
			pipeline.Status = flowRunInfo["state_type"].(string)
		}

		pipelines = append(pipelines, pipeline)
	}

	if len(pipelines) == 0 {
		c.JSON(http.StatusOK, []Pipeline{})
		return
	}

	c.JSON(http.StatusOK, pipelines)
}

func AddPipelineHandler(c *gin.Context) {
	var request PipelineRequest

	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	audioPath := request.AudioPath

	// Check if audio_path is a .wav file
	if len(audioPath) < 4 || audioPath[len(audioPath)-4:] != ".wav" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid audio file format (must be .wav)"})
		return
	}

	// Check if the file exists
	if !fileExists(request.AudioPath) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Specified file does not exist"})
		return
	}

	// Get deployment ids
	deploymentId, err := external.GetDeploymentIdByName("pipeline-voice-analysis")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get deployment ids"})
		return
	}

	parameters := map[string]interface{}{
		"audio_path": audioPath,
	}

	flowRunId, err := external.CreateFlowRun(deploymentId, parameters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create flow run"})
		return
	}

	_, err = external.DB.Exec(context.Background(), "INSERT INTO audio_results (flow_run_id, audio_path) VALUES ($1, $2)", flowRunId, audioPath)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Flow run %s created", flowRunId)})
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
