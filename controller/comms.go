package controller

import (
	"encoding/json"
	"fmt"
	"msg-app/backend/db"
	"msg-app/backend/redis"
	"msg-app/backend/types"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v4"
)

func GetMsgs(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)
	contactId, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid URL param", http.StatusBadRequest)
		return
	}
	messages, err := db.ContactMsgs(userId, int64(contactId))
	// fmt.Println(messages)
	if err != nil {
		http.Error(w, "Error getting your messages", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func GetOnline(w http.ResponseWriter, r *http.Request) {
	// userId := r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)
	contactId, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid URL param", http.StatusBadRequest)
		return
	}
	status := redis.IsUserOnline(int64(contactId))
	if status {
		var userOnline = types.UserOnline{UserOnlineStatus: true}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(userOnline)
		return
	} else {
		// userLastSeenTime, err := db.GetUserLastSeen(int64(contactId))
		// if err != nil {
		// 	http.Error(w, "Interval Server Error", http.StatusInternalServerError)
		// 	fmt.Println("Error getting user last seen comms.go", err)
		// 	return
		// }
		userLastSeen, err := redis.CheckUStatus(int64(contactId))
		if err != nil {
			http.Error(w, "Interval Server Error", http.StatusInternalServerError)
			fmt.Println("Error getting user last seen comms.go", err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(userLastSeen)
	}
}
