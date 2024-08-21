package config

import (
	"database/sql"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func Connect() error {
	var err error

	dir, _ := os.Getwd()
	db, err = sql.Open("sqlite3", filepath.Join(dir, "db", "tasks.db"))

	if err != nil {
		return err
	}

	return nil
}

func Disconnect() error {
	return db.Close()
}
