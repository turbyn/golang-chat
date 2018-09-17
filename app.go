package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/googollee/go-socket.io"
	"gopkg.in/mgo.v2"
)

type Message struct {
	Username string `json:"username"`
	Content  string `json:"content"`
}

type UsernameChange struct {
	Old string `json:"oldName"`
	New string `json:"newName"`
}

type Log struct {
	Message        Message
	UsernameChange UsernameChange
	Timestamp      time.Time
}

func main() {
	session, dbErr := mgo.Dial("localhost:7702")
	if dbErr != nil {
		log.Fatal(dbErr)
	}
	defer session.Close()

	server, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}

	c := session.DB("chatapp").C("logs")
	// c.DropCollection()

	server.On("connection", func(so socketio.Socket) {
		so.Join("chatroom")

		so.On("newUserJoined", func(username string) {
			// var welcomeMessage = " has joined"
			var serverMessage = username + " has joined"
			so.BroadcastTo("chatroom", "utilMessage", serverMessage)
		})

		so.On("newMessage", func(msg string) {
			var message Message
			json.Unmarshal([]byte(msg), &message)
			err = c.Insert(
				Log{message,
					UsernameChange{"", ""},
					time.Now()},
			)
			so.BroadcastTo("chatroom", "newServerMessage", msg)
		})

		so.On("usernameChange", func(msg string) {
			var usernameChange UsernameChange
			json.Unmarshal([]byte(msg), &usernameChange)
			so.BroadcastTo("chatroom", "usernameChangeMessage", msg)
			err = c.Insert(
				Log{Message{"", ""},
					usernameChange,
					time.Now()},
			)
		})

		so.On("disconnection", func() {
			log.Println("on disconnect")
		})
	})
	server.On("error", func(so socketio.Socket, err error) {
		log.Println("error:", err)
	})

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./static")))
	log.Println("Serving at localhost:5000...")
	log.Fatal(http.ListenAndServe(":5000", nil))
}

func recordDb() {
	log.Println("Saving to db")
}
