package main

import (
	"backend/routes"
	"backend/external"
)

func main() {
	external.InitDB()
	defer external.CloseDB()

	routes.Run()
}
