package controller

import (
	"encoding/json"
	"msg-app/backend/db"
	"msg-app/backend/redis"
	"msg-app/backend/types"
	"msg-app/backend/utils"
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

	var offSet int
	if offsetParam := r.URL.Query().Get("skip"); offsetParam == "" {
		http.Error(w, "Missing query params", http.StatusForbidden)
		utils.Log.Println("client error: Missing query params", r.RemoteAddr)
		return
	} else if offSet, err = strconv.Atoi(offsetParam); err != nil {
		http.Error(w, "Invalid query params", http.StatusBadRequest)
		utils.Log.Println("client error: Invalid query param", err, r.RemoteAddr)
		return
	}

	// queryParams := r.URL.Query()
	// // fmt.Println("queryParams", queryParams)
	// if queryParams["skip"] == nil {
	// 	http.Error(w, "Missing query params", http.StatusForbidden)
	// 	utils.Log.Println("client error: Missing query params", r.RemoteAddr)
	// 	return
	// }
	// fmt.Println("queryParam skip", queryParams["skip"], queryParams["skip"] == nil)
	// offsetParam, perr := strconv.Atoi(queryParams["skip"][0])
	// if perr != nil {
	// 	http.Error(w, "Invalid query params", http.StatusBadRequest)
	// 	utils.Log.Println("client error: Invalid query param", perr, r.RemoteAddr)
	// 	return
	// }
	// if param != 5 {
	// 	http.Error(w, "Unaccepted query param", http.StatusForbidden)
	// 	utils.Log.Println("client error: Unaccepted query param", perr, r.RemoteAddr)
	// 	return
	// }
	// fmt.Println("param", param)

	messages, err := db.ContactMsgs(userId, int64(contactId), offSet)
	// fmt.Println(messages)
	if err != nil {
		http.Error(w, "Error getting your messages", http.StatusInternalServerError)
		utils.Log.Println("cntrl error: getting messages from db", err)
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
		utils.Log.Println("client error: ", err, r.RemoteAddr)
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
			//fmt.Println("Error getting user last seen comms.go", err)
			utils.Log.Println("cntrl error: getting user's last seen", err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(userLastSeen)
	}
}
