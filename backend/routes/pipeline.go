package routes

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	amqp "github.com/rabbitmq/amqp091-go"
)

type PipelineRequest struct {
	AudioPath string `json:"audio_path"`
}


func addPipelineRoutes(rg *gin.RouterGroup) {
	pipeline := rg.Group("/pipeline")
	pipeline.POST("/new", AddPipelineHandler)
}



func AddPipelineHandler(c *gin.Context) {
	var request PipelineRequest

	// Parse JSON request body
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

	// Send message to RabbitMQ
	err := SendMessageToRabbitMQ(request.AudioPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message to RabbitMQ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pipeline added successfully"})
}

func SendMessageToRabbitMQ(audioPath string) error {
	// RabbitMQ connection URL
	amqpURL := "amqp://guest:guest@localhost:5672/"

	// Connect to RabbitMQ
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	// Create a channel
	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	// Declare a queue named "hello"
	q, err := ch.QueueDeclare(
		"hello2", // Queue name
		false,   // Durable
		false,   // Delete when unused
		false,   // Exclusive
		false,   // No-wait
		nil,     // Arguments
	)
	if err != nil {
		return err
	}

	// Convert audioPath to JSON
	messageBody, err := json.Marshal(map[string]string{"audio_path": audioPath})
	if err != nil {
		return err
	}

	// Publish the message to the "hello" queue
	err = ch.Publish(
		"",     // Exchange
		q.Name, // Routing key
		false,  // Mandatory
		false,  // Immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        messageBody,
		},
	)
	if err != nil {
		return err
	}

	return nil
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}