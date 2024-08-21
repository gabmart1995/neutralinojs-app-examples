package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"reflect"
	"sqlite3-extension/config"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type NeutralinoAuth struct {
	NlPort         string `json:"nlPort"`
	NlToken        string `json:"nlToken"`
	NlConnectToken string `json:"nlConnectToken"`
	NlExtensionId  string `json:"nlExtensionId"`
}

type Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

type SenderMessage struct {
	Id          string  `json:"id"`
	Method      string  `json:"method"`
	AccessToken string  `json:"accessToken"`
	Data        Message `json:"data"`
}

var auth NeutralinoAuth

func logger(message string) {
	logLine := fmt.Sprintf("[%s]: %s", auth.NlExtensionId, message)
	fmt.Println(logLine)
}

func filterEvents(conn *websocket.Conn, message Message) {
	sendMessage := func(messageSend Message) {
		data := SenderMessage{
			Id:          uuid.NewString(),
			Method:      "app.broadcast",
			AccessToken: auth.NlToken,
			Data:        messageSend,
		}

		bytes, err := json.Marshal(&data)

		if err != nil {
			panic(err)
		}

		writerSocket, err := conn.NextWriter(websocket.TextMessage)

		if err != nil {
			fmt.Println("encoding error")
			return
		}

		_, err = writerSocket.Write(bytes)

		if err != nil {
			panic(err)
		}

		// cerramos el writeSocket
		if err := writerSocket.Close(); err != nil {
			panic(err)
		}
	}

	// logs de eventos
	// fmt.Println("go websocket: ", message)

	// eventos de conexion
	if message.Data == nil {
		if message.Event == "dbConnect" {
			if err := config.Connect(); err != nil {
				panic(err)
			}

			logger("conexion a bd exitosa")

			sendMessage(Message{
				Event: "dbConnectSuccessful",
				Data: map[string]interface{}{
					"message": "conectado",
					"ok":      true,
				},
			})
		}

		if message.Event == "dbDisconnect" && message.Data == nil {
			if err := config.Disconnect(); err != nil {
				panic(err)
			}

			logger("desconexion a bd exitosa")
		}
	}

	// eventos de base de datos
	if reflect.ValueOf(message.Data).Kind().String() == "string" {
		sql := message.Data.(string)

		if message.Event == "write" {
			if err := config.Write(sql); err != nil {
				panic(err)
			}
		}

		if message.Event == "read" {
			data, err := config.Read(sql)

			if err != nil {
				panic(err)
			}

			// fmt.Println(data)

			sendMessage(Message{
				Event: "tasks",
				Data:  data,
			})
		}
	}
}

func main() {
	// cierra la conexion si termina el proceso
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	// spawneamos la informacion del proceso STDIN
	scanner := bufio.NewScanner(os.Stdin)

	// extrae el JSON del proceso de entrada de neutralino
	// y lo serializa
	for scanner.Scan() {
		if err := json.Unmarshal(scanner.Bytes(), &auth); err != nil {
			panic(err)
		}
	}

	if scanner.Err() != nil {
		panic(scanner.Err())
	}

	// armamos la url del websocket
	url := fmt.Sprintf(
		"ws://localhost:%s?extensionId=%s&connectToken=%s",
		auth.NlPort,
		auth.NlExtensionId,
		auth.NlConnectToken,
	)

	// inicializamos el client websocket
	// generamos una conexion usando un dial
	conn, _, err := websocket.DefaultDialer.Dial(url, nil)

	if err != nil {
		log.Fatal("dial err:", err)
	}

	defer conn.Close()

	// establecemos un canal de comunicacion
	done := make(chan struct{})

	// goroutine que maneja la recepcion de datos por el Websocket
	go func() {
		// una vez finalizada cierra el canal
		defer close(done)
		var messageSocket Message

		// agregamos un bucle inifinito para mantener la
		// conexion y leer los mensajes de neutralino
		for {
			_, message, err := conn.ReadMessage()

			if err != nil {
				// log.Println("read:", err)
				return
			}

			// en este punto se recibe los datos del socket
			// se serializa a un struct
			if err := json.Unmarshal(message, &messageSocket); err != nil {
				panic(err)
			}

			filterEvents(conn, messageSocket)
		}
	}()

	// establecemos un select que controla la conexion con el SO.
	for {
		select {
		case <-done:
			return

		case <-interrupt:

			// Cleanly close the connection by sending a close message and then
			// waiting (with timeout) for the server to close the connection.
			err := conn.WriteMessage(
				websocket.CloseMessage,
				websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""),
			)

			if err != nil {
				fmt.Println("go write close:", err)
				return
			}

			select {
			case <-done:
			case <-time.After(time.Second):
			}

			return
		}
	}
}
