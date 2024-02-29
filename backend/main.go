package main

import (
	"backend/routes"
	"backend/db"
)

func main() {
	db.InitDB()
	defer db.CloseDB()

	routes.Run()
}
