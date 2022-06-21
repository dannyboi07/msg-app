package controller

import (
	"encoding/json"
	"fmt"
	"msg-app/backend/db"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
)

func GetContacts(w http.ResponseWriter, r *http.Request) {
	userDetails := r.Context().Value("userDetails").(jwt.MapClaims)
	contacts, err := db.UserContacts(userDetails["UserId"].(int64))
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contacts)
}
