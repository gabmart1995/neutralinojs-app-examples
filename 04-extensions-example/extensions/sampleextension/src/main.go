package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

type NeutralinoAuth struct {
	NlPort         string `json:"nlPort"`
	NlToken        string `json:"nlToken"`
	NlConnectToken string `json:"nlConnectToken"`
	NlExtensionId  string `json:"nlExtensionId"`
}

type Message struct {
	Event string `json:"event"`
	// Data  interface{} `json:"data"`
}

var auth NeutralinoAuth

/*func logger(message string) {
	logLine := fmt.Sprintf("[%s] %s", auth.NlExtensionId, message)
	fmt.Println(logLine)
}*/

func sendMessage(message Message) {
	fmt.Println("go websocket: ", message)

	if message.Event == "eventToExtension" {
		// logger(message.Data)
		fmt.Println("evento hallado")
	}
}

func handleSocket(conn *websocket.Conn, done chan struct{}) {
	defer close(done)

	// agregamos un bucle inifinito para mantener la
	// conexion
	for {
		var messageSocket Message
		_, message, err := conn.ReadMessage()

		if err != nil {
			//log.Println("read:", err)
			return
		}

		// en este punto se recibe los datos del socket
		// se serializa y se manda

		if err := json.Unmarshal(message, &messageSocket); err != nil {
			panic(err)
		}

		// fmt.Println(messageSocket)

		sendMessage(messageSocket)
	}
}

func main() {
	// cierra la conexion si termina el proceso
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	// leemos la informacion del proceso STDIN
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

	go handleSocket(conn, done)

	// establecemos un select
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
