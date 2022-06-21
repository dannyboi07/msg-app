package utils

import (
	"context"
	"fmt"
	"msg-app/backend/db"
	"net/http"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		accessToken, err := r.Cookie("accessToken")
		if err != nil {
			http.Error(w, "Missing access token cookie", http.StatusUnauthorized)
			return
		}
		// bearer := r.Header.Get("Authorization")
		// if bearer == "" {
		// 	http.Error(w, "Missing token", http.StatusUnauthorized)
		// 	return
		// }
		// unverifiedToken := strings.Split(bearer, "Bearer ")[1]
		// if unverifiedToken == "" {
		// 	http.Error(w, "Missing token", http.StatusBadRequest)
		// 	return
		// }
		mapClaims, err, statusCode := VerifyUserToken(accessToken.Value)
		if err != nil {
			http.Error(w, err.Error(), statusCode)
			return
		}
		exists, err := db.UserExistsById(int64(mapClaims["UserId"].(float64)))
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			fmt.Println(err)
			return
		} else if !exists {
			http.Error(w, "User doesn't exist", http.StatusUnauthorized)
			return
		}
		mapClaims["UserId"] = int64(mapClaims["UserId"].(float64))
		ctxWithUserDetails := context.WithValue(r.Context(), "userDetails", mapClaims)
		next.ServeHTTP(w, r.WithContext(ctxWithUserDetails))
	})
}

// func AuthMiddleware(w http.ResponseWriter, r *http.Request) {
// 	unverifiedToken := strings.Split(r.Header.Get("Authorization"), "Bearer ")[1]
// 	if unverifiedToken == "" {
// 		http.Error(w, "Missing token", http.StatusBadRequest)
// 		return
// 	}
// 	mapClaims, err, statusCode := VerifyUserToken(unverifiedToken)
// 	if err != nil {
// 		http.Error(w, err.Error(), statusCode)
// 		return
// 	}
// 	fmt.Println("claims", mapClaims, "email", mapClaims["UserId"])
// 	exists, err := db.UserExistsById(mapClaims["UserId"].(int64))
// 	if err != nil {
// 		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
// 		return
// 	} else if !exists {
// 		http.Error(w, "User doesn't exist", http.StatusUnauthorized)
// 		return
// 	}
// 	ctxWithUserDetails := context.WithValue(r.Context(), "userDetails", mapClaims)
// 	http.serhtt
// 	// r.Context()
// 	// fmt.Println("req headers", strings.Split(r.Header.Get("Authorization"), "Bearer "))
// 	// fmt.Println("req context", r.Context())
// }
