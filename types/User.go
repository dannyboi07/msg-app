package types

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type User struct {
	Name        *string `json:"name"`
	Email       *string `json:"email"`
	Password    *string `json:"-"`
	Profile_Pic *string `json:"profile_pic"`
}

type UserWithId struct {
	UserId *int64 `json:"user_id"`
	User
}

type UserLoginInput struct {
	Email    *string `json:"email"`
	Password *string `json:"password"`
	TimeZone *string `json:"user_tz"`
}

type UserLoginDbOutout struct {
	Name        *string `json:"name"`
	Email       *string `json:"email"`
	Password    *string `json:"-"`
	Profile_Pic *string `json:"profile_pic"`
}

type UserForToken struct {
	UserId *int64
	Email  *string
}

type UserWithJwt struct {
	Name        *string `json:"name"`
	Email       *string `json:"email"`
	Profile_Pic *string `json:"profile_pic"`
	Token       *string `json:"token"`
}

type UserWithoutJwt struct {
	Name        *string `json:"name"`
	Email       *string `json:"email"`
	Profile_Pic *string `json:"profile_pic"`
}

type Contact struct {
	UserId      *int64  `json:"user_id"`
	Name        *string `json:"name"`
	Profile_Pic *string `json:"profile_pic"`
}

type WsMessage struct {
	Type *string `json:"type"`
	From *int64  `json:"from"`
	To   *int64  `json:"to"`
	Text *string `json:"text"`
}

type WsPongMsg struct {
	Type string `json:"type"`
}

type Clients struct {
	ClientConns map[int64]*websocket.Conn
	sync.RWMutex
}

type Message struct {
	MessageId int64     `json:"message_id"`
	From      int64     `json:"from"`
	To        int64     `json:"to"`
	Text      string    `json:"text"`
	Time      time.Time `json:"time"`
}

type RedisStruct struct {
	ServerId int
}

type UserOnline struct {
	UserOnlineStatus bool `json:"last_seen"`
}

type UserLastSeen struct {
	UserLastSeenTime string `json:"last_seen"`
}

// type UserLastSeen struct {
// 	UserLastSeenTime time.Time `json:"last_seen"`
// }
