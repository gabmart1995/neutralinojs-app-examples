package config

import (
	"database/sql"
	"os"
	"path/filepath"
	"sqlite3-extension/tasks"

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

func Write(sql string) error {
	stmt, err := db.Prepare(sql)

	if err != nil {
		return err
	}

	defer stmt.Close()

	_, err = stmt.Exec()

	if err != nil {
		return err
	}

	return nil
}

func Read(sql string) ([]tasks.Tasks, error) {
	var tasksTable []tasks.Tasks

	rows, err := db.Query(sql)

	if err != nil {
		return tasksTable, err
	}

	defer rows.Close()

	for rows.Next() {
		var task tasks.Tasks

		err = rows.Scan(
			&task.Id,
			&task.Title,
			&task.Description,
			&task.Completed,
			&task.CreatedAt,
			&task.UpdatedAt,
		)

		if err != nil {
			return tasksTable, err
		}

		tasksTable = append(tasksTable, task)
	}

	if rows.Err() != nil {
		return tasksTable, rows.Err()
	}

	return tasksTable, nil
}
