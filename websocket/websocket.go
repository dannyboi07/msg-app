package ws

import (
	"fmt"
	"msg-app/backend/db"
	"msg-app/backend/redis"
	"msg-app/backend/types"
	"net/http"
	"time"

	goredis "github.com/go-redis/redis/v9"
	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000" || origin == "http://localhost:8080"
	},
}

var WsClients *types.Clients

func Handler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)

	// userId := userDetails["UserId"].(int64)
	WsClients.RWMutex.RLock()
	if _, userPresent := WsClients.ClientConns[userId]; userPresent {
		http.Error(w, "User already connected", http.StatusForbidden)
		WsClients.RWMutex.RUnlock()
		return
	}
	WsClients.RWMutex.RUnlock()
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Error establishing Websocket connection", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	WsClients.RWMutex.Lock()
	WsClients.ClientConns[userId] = conn

	err = redis.SetUOnline(userId) // redis
	if err != nil {
		fmt.Println("redis setuonline err", err, &conn)
	}
	WsClients.RWMutex.Unlock()
	conn.SetReadLimit(4096)

	redis.PingRedis()
	fmt.Println("client here", userId)
	go wsConnHandler(conn, userId)
}

func wsConnHandler(conn *websocket.Conn, userId int64) {
	defer conn.Close()
	contactIdChan := make(chan int64)
	closeChildChan := make(chan bool)
	closeParentChan := make(chan bool)
	go wsPubSubHandler(conn, contactIdChan, closeChildChan, closeParentChan)

forLoop:
	for {
		select {
		case <-closeParentChan:
			fmt.Println("Parent wsConnHandler received error from sub handling child")
			go wsPubSubHandler(conn, contactIdChan, closeChildChan, closeParentChan)
			continue forLoop
		default:
			var message types.WsMessage
			err := conn.ReadJSON(&message)
			if err != nil {
				fmt.Println("err under readjson", err)
				break forLoop
			} else if message.Type == nil || message.To == nil || message.From == nil {
				fmt.Println("Missing fields in Websocket message")
				break forLoop
			} else {
				// Verifying whether the "from" field in WS message sent from client side actually exists in the connection list.
				// A more reliable alternative is querying the DB for user existence based on userId. Going with this since it's
				// an in-memory lookup and faster.
				WsClients.RWMutex.RLock()
				if _, senderIsPresent := WsClients.ClientConns[*message.From]; !senderIsPresent {
					fmt.Println("Sender not present in list of connections, sent userId:", message.From)
					break forLoop
				}
				WsClients.RWMutex.RUnlock()

				switch *message.Type {
				case "msg":
					if message.Text == nil {
						fmt.Println("Missing fields in Websocket message sent by client")
						break forLoop
					}
					WsClients.RWMutex.RLock()
					if recipientConn, recipientPresent := WsClients.ClientConns[*message.To]; recipientPresent {
						fmt.Println("sending message")
						WsClients.RWMutex.RUnlock()
						msgToSend, err := db.InsertMessage(message)
						if err != nil {
							fmt.Println("Error inserting message in db", err)
							break forLoop
						}

						WsClients.RWMutex.Lock()
						err = recipientConn.WriteJSON(msgToSend)
						errBouncingBack := conn.WriteJSON(msgToSend)
						WsClients.RWMutex.Unlock()
						if err != nil {
							fmt.Println("Error sending message", err)
							// break forLoop
						} else if errBouncingBack != nil {
							fmt.Println("Error bouncing message back to sender", err)
							break forLoop
						}
					} else {
						WsClients.RWMutex.RUnlock()
					}
				case "sub":
					contactIdChan <- *message.To
					continue forLoop
				case "getstatus":
					contactStatus, _ := redis.CheckUStatus(*message.To)
					contactLastSeen := types.UserLastSeen{UserLastSeenTime: contactStatus}
					WsClients.Lock()
					conn.WriteJSON(contactLastSeen)
					WsClients.Unlock()
				}
			}
		}
	}
	closeChildChan <- true
	fmt.Println("Deleting user conn by id", userId)
	WsClients.RWMutex.Lock()
	delete(WsClients.ClientConns, userId)
	redis.SetUOffline(userId, time.Now().Format("2006-01-02T15:04:05Z07:00"))
	WsClients.RWMutex.Unlock()
}

func wsPubSubHandler(conn *websocket.Conn, contactId chan int64, closeChild <-chan bool, closeParent chan<- bool) {
	fmt.Println("pubsubHandler started")
	// initContactId := <-contactId
	subscribe := false
	// pubsub := redis.SubUserStatus(initContactId)
	// subChannel := pubsub.Channel()
	// if err := redis.PubSubWait(pubsub); err != nil {
	// 	fmt.Println("Error waiting for pubsub", err)
	// 	pubsub.Close()
	// 	closeParent <- true
	// 	return
	// }

	var pubsub *goredis.PubSub
	var globalContactId int64
	var subChannel <-chan *goredis.Message
forLoop:
	for {
		if subscribe == true {
			if pubsub != nil {
				fmt.Println("Pubsub closing")
				pubsub.Close()
			}
			fmt.Println("pubsubHandler resubbing")
			pubsub = redis.SubUserStatus(globalContactId)
			subChannel = pubsub.Channel(goredis.WithChannelHealthCheckInterval(0))
			subscribe = false
		}
		select {
		case contactId := <-contactId:
			if contactId != globalContactId {
				fmt.Println("pubsubHandler contactId", contactId)
				globalContactId = contactId
				subscribe = true
				continue forLoop
			}
		case msgs := <-subChannel:
			// for msg := range msgs {

			// }
			fmt.Println("pubsubHandler pub received on sub", msgs, msgs.Pattern)
			// if fmt.Sprintf("userstatus %d", globalContactId) == msgs.Pattern {
			// }
			WsClients.RWMutex.Lock()
			contactStatus := types.UserLastSeen{UserLastSeenTime: msgs.Payload}
			err := conn.WriteJSON(contactStatus)
			if err != nil {
				WsClients.RWMutex.Unlock()
				break forLoop
			}
			WsClients.RWMutex.Unlock()
		case <-closeChild:
			fmt.Println("pubsubHandler closing")
			break forLoop
			// default:
			// 	fmt.Println("pubsubHandler default")
			// 	for msg := range subChannel {
			// 		fmt.Println("pubsubHandler pub received on sub", msg.Channel, msg.Payload)
			// 	}
		}
	}
	fmt.Println("pubsubHandler closing at end")
	if pubsub != nil {
		pubsub.Close()
	}
	closeParent <- true
}

// func wsConnHandler(conn *websocket.Conn, userId int64) {
// 	defer conn.Close()

// 	for {
// 		var message types.WsMessage
// 		err := conn.ReadJSON(&message)
// 		if err != nil {
// 			fmt.Println("err under readjson", err)
// 			break
// 		} else if message.Type == nil || message.From == nil || message.To == nil || message.Text == nil {
// 			// Closing WS conn in case of missing fields
// 			fmt.Println("Missing fields in Websocket message sent by client")
// 			break
// 		} else if *message.Type == "ping" {
// 			pongMessage := types.WsPongMsg{Type: "Pong"}

// 			WsClients.RWMutex.Lock()
// 			err := conn.WriteJSON(&pongMessage)
// 			WsClients.RWMutex.Unlock()
// 			if err != nil {
// 				fmt.Println(err)
// 				break
// 			}

// 			continue
// 		}
// 		// Verifying whether the "from" field in WS message sent from client side actually exists in the connection list.
// 		// A more reliable alternative is querying the DB for user existence based on userId. Going with this since it's
// 		// an in-memory lookup and faster.
// 		// _, senderPresent := WsClients.ClientConns[*message.From]; senderPresent
// 		WsClients.RWMutex.RLock()
// 		redis.CheckUStatus(userId)
// 		if userStatus := redis.CheckUStatus(userId); userStatus {
// 			if userToSendConn, recepientPresent := WsClients.ClientConns[*message.To]; recepientPresent {
// 				fmt.Println("sending message")
// 				WsClients.RWMutex.RUnlock()
// 				msgToSend, err := db.InsertMessage(message)
// 				if err != nil {
// 					fmt.Println("Error inserting message in db", err)
// 					break
// 				}

// 				WsClients.RWMutex.Lock()
// 				err = userToSendConn.WriteJSON(msgToSend)
// 				errBouncingBack := conn.WriteJSON(msgToSend)
// 				WsClients.RWMutex.Unlock()
// 				if err != nil {
// 					fmt.Println("Error sending message", err)
// 					break
// 				} else if errBouncingBack != nil {
// 					fmt.Println("Error bouncing message back to sender", err)
// 					break
// 				}
// 			}
// 		} else {
// 			WsClients.RWMutex.RUnlock()
// 			fmt.Println("breaking when msg is sent", userStatus, *message.From)
// 			break
// 		}

// 	}
// 	fmt.Println("Deleting user conn by id", userId)
// 	WsClients.RWMutex.Lock()
// 	delete(WsClients.ClientConns, userId)
// 	redis.SetUOffline(userId)
// 	db.UpdateLastSeen(userId, time.Now())
// 	WsClients.RWMutex.Unlock()
// }

// func wsConnPinger(userId int64, closeChild chan bool, closeParent chan bool) {
// 	for {
// 		time.Sleep(time.Second * 45)
// 		select {
// 		case <-closeChild:
// 			fmt.Println("pinger closing chan", userId)
// 			return
// 		default:
// 			WsClients.RWMutex.RLock()
// 			conn := WsClients.ClientConns[userId]
// 			WsClients.RWMutex.RUnlock()
// 			WsClients.RWMutex.Lock()
// 			err := conn.WriteMessage(websocket.PingMessage, nil)
// 			WsClients.RWMutex.Unlock()
// 			if err != nil {
// 				closeParent <- true
// 				fmt.Println("pinger closing err 2", userId)
// 				return
// 			}
// 			fmt.Println("pinged", userId)
// 		}
// 	}
// }

// func wsConnHandler(conn *websocket.Conn, userId int64) {
// 	closeChildChan := make(chan bool, 2)
// 	closeParentChan := make(chan bool, 2)
// 	var message types.WsMessage
// 	go wsConnPinger(userId, closeChildChan, closeParentChan)
// forLoop:
// 	for {
// 		select {
// 		case <-closeParentChan:
// 			fmt.Println("parent closing")
// 			break forLoop
// 		default:
// 			err := conn.ReadJSON(&message)
// 			if err != nil {
// 				fmt.Println(err)
// 				break forLoop
// 			} else if message.Type == nil || message.From == nil || message.To == nil || message.Message == nil {
// 				// Closing WS conn in case of missing fields
// 				fmt.Println("Missing fields in Websocket message sent by client")
// 				break forLoop
// 			} else if *message.Type == "ping" {
// 				continue
// 			}
// 			// Verifying whether the "from" field in WS message sent from client side actually exists in the connection list.
// 			// A more reliable alternative is querying the DB for user existence based on userId. Going with this since it's
// 			// an in-memory lookup and faster.
// 			WsClients.RWMutex.RLock()
// 			if _, senderPresent := WsClients.ClientConns[*message.From]; senderPresent {
// 				if userToSendConn, recepientPresent := WsClients.ClientConns[*message.To]; recepientPresent {
// 					fmt.Println("sending message")
// 					WsClients.RWMutex.RUnlock()
// 					WsClients.RWMutex.Lock()
// 					err := userToSendConn.WriteJSON(&message)
// 					WsClients.RWMutex.Unlock()
// 					if err != nil {
// 						fmt.Println("Error sending message", err)
// 						break forLoop
// 					}
// 				}
// 			} else {
// 				WsClients.RWMutex.RUnlock()
// 				fmt.Println("breaking when msg is sent", senderPresent, *message.From)
// 				break forLoop
// 			}
// 		}
// 	}
// 	conn.Close()
// 	closeChildChan <- true
// 	fmt.Println("Deleting user conn by id", userId)
// 	WsClients.RWMutex.Lock()
// 	delete(WsClients.ClientConns, userId)
// 	WsClients.RWMutex.Unlock()
// }
