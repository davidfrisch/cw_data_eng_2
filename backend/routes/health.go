package routes

import (
	"github.com/gin-gonic/gin"
)

func addHealthRoutes(rg *gin.RouterGroup) {
	health := rg.Group("/health")
	health.GET("/", HealthHandler)
}

func HealthHandler(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Health OK"})
}
