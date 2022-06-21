package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"msg-app/backend/db"
	"msg-app/backend/types"
	"msg-app/backend/utils"
	"net/http"
	"strings"
)

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var maxFileSize int64 = 1000 * 1000 * 2
	r.Body = http.MaxBytesReader(w, r.Body, maxFileSize+2000000)
	if !strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		http.Error(w, "Invalid content type", http.StatusBadRequest)
		return
	}

	reader, err := r.MultipartReader()
	if err != nil {
		http.Error(w, "Interval Server Error", http.StatusInternalServerError)
		fmt.Println(err.Error())
		return
	}

	nameField, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	} else if nameField.FormName() != "name" {
		http.Error(w, "Expected missing field: name", http.StatusBadRequest)
		return
	}
	name := utils.ReadPartToString(nameField)
	if !utils.ValidName(&name) {
		http.Error(w, "Invalid name, must be greater than 3 and consist of only alphabetic characters", http.StatusBadRequest)
		return
	}

	emailPart, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	} else if emailPart.FormName() != "email" {
		http.Error(w, "Expected missing field: email", http.StatusBadRequest)
		return
	}
	email := utils.ReadPartToString(emailPart)
	userExists, err := db.UserExists(&email)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println(err.Error())
		return
	}
	if userExists {
		http.Error(w, "User already exists, try \"Forgot Password\" if you've forgotten your password to recover", http.StatusConflict)
		return
	}

	passwordField, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, "Expected missing field: password", http.StatusBadRequest)
		return
	} else if passwordField.FormName() != "password" {
		http.Error(w, "Expected missing field: password", http.StatusBadRequest)
		return
	}
	password := utils.ReadPartToString(passwordField)

	profilePic, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	} else if err == io.EOF {
		hashedPw, err := utils.HashPassword(password, 10)
		if err != nil {
			http.Error(w, "Interval Server Error", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		picStr := ""
		var user types.User = types.User{Name: &name, Email: &email, Profile_Pic: &picStr, Password: &hashedPw}
		err = db.InsertUser(&user)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(user)
	} else if err != io.EOF {
		validFile, buf, fileExt := utils.ValidFileType(profilePic, &utils.ProfImgValRegEx)
		if !validFile {
			http.Error(w, "Unacceptable file type", http.StatusUnprocessableEntity)
			return
		}
		statusInt, err, fileLink := utils.FileUpload(profilePic, buf, "static/public/profile-pics/", fileExt, maxFileSize)
		if err != nil {
			http.Error(w, err.Error(), statusInt)
			return
		}

		hashedPw, err := utils.HashPassword(password, 10)
		if err != nil {
			http.Error(w, "Interval Server Error", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		var user types.User = types.User{Name: &name, Email: &email, Profile_Pic: &fileLink, Password: &hashedPw}
		err = db.InsertUser(&user)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(user)
	}
}

func LoginUser(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1000000)
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Inacceptable content type", http.StatusBadRequest)
		return
	}
	jDec := json.NewDecoder(r.Body)
	jDec.DisallowUnknownFields()
	var userLogin types.UserLoginInput
	statusCode, err := utils.JsonReqErrCheck(jDec.Decode(&userLogin))
	if err != nil {
		http.Error(w, err.Error(), statusCode)
		return
	}
	if userLogin.Email == nil {
		http.Error(w, "Email field is empty", http.StatusBadRequest)
		return
	} else if userLogin.Password == nil {
		http.Error(w, "Password field is empty", http.StatusBadRequest)
		return
	}

	user, err := db.GetUser(userLogin.Email)
	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "User doesn't exist", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		fmt.Println(err.Error())
		return
	}
	trueUser := utils.AuthPassword(*user.Password, *userLogin.Password)
	if !trueUser {
		http.Error(w, "Incorrect password", http.StatusUnauthorized)
		return
	}
	fmt.Println("name", *user.Name, "email", *user.Email, "id", *user.UserId, "userprof", *user.Profile_Pic)
	//var finalUserDetails types.UserWithJwt
	userForToken := types.UserForToken{UserId: user.UserId, Email: user.Email}
	token, err := utils.CreateJwt(userForToken)
	if err != nil {
		http.Error(w, "Internal Server Error, try again", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	// finalUserDetails := types.UserWithJwt{Name: user.Name, Email: user.Email, Profile_Pic: user.Profile_Pic, Token: &token}
	// finalUserDetails := types.UserWithoutJwt{Name: user.Name, Email: user.Email, Profile_Pic: user.Profile_Pic}
	cookie := &http.Cookie{Name: "accessToken", Value: token, MaxAge: 3600 * 6, Path: "/", HttpOnly: true}
	w.Header().Set("Content-Type", "application/json")
	// w.Header().Set("Set-Cookie", "cookieName=cookieValue")
	http.SetCookie(w, cookie)
	json.NewEncoder(w).Encode(user)
}
