package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"reflect"
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
	//fmt.Println("type:", reflect.ValueOf(message.Data).Kind().String())

	// verificamos el tipo de dato
	//isStringData := reflect.ValueOf(message.Data).Kind().String() == "string"
	isSliceString := reflect.ValueOf(message.Data).Kind().String() == "slice"

	if message.Data == nil {
		if message.Event == "getHomeDirectory" {
			logger("obtener user directory")

			userDirectory, err := os.UserHomeDir()

			if err != nil {
				panic(err)
			}

			// mandamos el mensaje de vuelta
			sendMessage(Message{
				Event: "getHomeDirectory",
				Data:  userDirectory,
			})
		}
	}

	if isSliceString {
		if message.Event == "join" {
			logger("path join")

			data := message.Data.([]interface{})
			newRouteArray := make([]string, len(data))

			for _, value := range data {
				newRouteArray = append(newRouteArray, value.(string))
			}

			uri := filepath.Join(newRouteArray...)

			sendMessage(Message{
				Event: "join",
				Data:  uri,
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

	// fmt.Println(url)

	// inicializamos el client websocket
	// generamos una conexion usando un dial
	conn, _, err := websocket.DefaultDialer.Dial(url, nil)

	if err != nil {
		log.Fatal("dial err:", err)
	}

	//fmt.Println(conn)

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
