package external

import (
	"context"
	"github.com/jackc/pgx/v5"
	"log"
	"fmt"
)

var DB *pgx.Conn

func InitDB() {
	conn, err := pgx.Connect(context.Background(), "postgres://postgres:postgres@localhost:5432/audio_results")
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	DB = conn
	fmt.Println("Database connection established.")
}

func CloseDB() {
	if DB != nil {
		DB.Close(context.Background())
		fmt.Println("Database connection closed.")
	}
}