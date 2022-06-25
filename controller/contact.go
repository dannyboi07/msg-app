package controller

import (
	"encoding/json"
	"msg-app/backend/db"
	"msg-app/backend/utils"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
)

func GetContacts(w http.ResponseWriter, r *http.Request) {
	userDetails := r.Context().Value("userDetails").(jwt.MapClaims)
	contacts, err := db.UserContacts(userDetails["UserId"].(int64))
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		utils.Log.Println("cntrl error: getting user's contacts from db", err)
		// fmt.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contacts)
}
