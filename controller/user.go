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

	"github.com/golang-jwt/jwt/v4"
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
		utils.Log.Println("cntrl error: initing multipart reader", err)
		// fmt.Println(err.Error())
		return
	}

	nameField, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		utils.Log.Println("client error: nextPart:nameField", err, r.RemoteAddr)
		return
	} else if nameField.FormName() != "name" {
		http.Error(w, "Expected missing field: name", http.StatusBadRequest)
		utils.Log.Println("client error: 'name' field name not found", r.RemoteAddr)
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
		utils.Log.Println("client error: nextPart:emailField", err, r.RemoteAddr)
		return
	} else if emailPart.FormName() != "email" {
		http.Error(w, "Expected missing field: email", http.StatusBadRequest)
		utils.Log.Println("client error: 'email' field name not found", r.RemoteAddr)
		return
	}
	email := utils.ReadPartToString(emailPart)
	userExists, err := db.UserExists(&email)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		// fmt.Println(err.Error())
		utils.Log.Println("cntrl error: getting user details from db", err)
		return
	}
	if userExists {
		http.Error(w, "User already exists, try \"Forgot Password\" if you've forgotten your password to recover", http.StatusConflict)
		return
	}

	passwordField, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, "Expected missing field: password", http.StatusBadRequest)
		utils.Log.Println("client error: nextPart:password", err, r.RemoteAddr)
		return
	} else if passwordField.FormName() != "password" {
		http.Error(w, "Expected missing field: password", http.StatusBadRequest)
		utils.Log.Println("client error: 'password' field name not found", r.RemoteAddr)
		return
	}
	password := utils.ReadPartToString(passwordField)

	profilePic, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		utils.Log.Println("cntrl error: ", err)
		return
	} else if err == io.EOF {
		hashedPw, err := utils.HashPassword(password, 10)
		if err != nil {
			http.Error(w, "Interval Server Error", http.StatusInternalServerError)
			// fmt.Println(err)
			utils.Log.Println("cntrl error: hashing password", err)
			return
		}
		picStr := ""
		var user types.User = types.User{Name: &name, Email: &email, Profile_Pic: &picStr, Password: &hashedPw}
		err = db.InsertUser(&user)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			utils.Log.Println("cntrl error: Inserting user in db", err)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(user)
	} else if err != io.EOF {
		validFile, buf, fileExt := utils.ValidFileType(profilePic, &utils.ProfImgValRegEx)
		if !validFile {
			http.Error(w, "Unacceptable file type", http.StatusUnprocessableEntity)
			utils.Log.Println("client error: 'Invalid prof-pic file type'", r.RemoteAddr)
			return
		}
		statusInt, err, fileLink := utils.FileUpload(profilePic, buf, "static/public/profile-pics/", fileExt, maxFileSize)
		if err != nil {
			http.Error(w, err.Error(), statusInt)
			utils.Log.Println("cntrl/client error: prof-pic upload", err)
			return
		}

		hashedPw, err := utils.HashPassword(password, 10)
		if err != nil {
			http.Error(w, "Interval Server Error", http.StatusInternalServerError)
			// fmt.Println(err)
			utils.Log.Println("cntrl error: hashing password", err)
			return
		}
		var user types.User = types.User{Name: &name, Email: &email, Profile_Pic: &fileLink, Password: &hashedPw}
		err = db.InsertUser(&user)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			utils.Log.Println("cntrl error: inserting user into db", err)
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
		utils.Log.Println("client error: invalid content type", r.RemoteAddr)
		return
	}
	jDec := json.NewDecoder(r.Body)
	jDec.DisallowUnknownFields()
	var userLogin types.UserLoginInput
	statusCode, err := utils.JsonReqErrCheck(jDec.Decode(&userLogin))
	if err != nil {
		http.Error(w, err.Error(), statusCode)
		utils.Log.Println("cntrl/client error: ", err)
		return
	}
	if userLogin.Email == nil {
		http.Error(w, "Email field is empty", http.StatusBadRequest)
		utils.Log.Println("client error: Missing email field", r.RemoteAddr)
		return
	} else if userLogin.Password == nil {
		http.Error(w, "Password field is empty", http.StatusBadRequest)
		utils.Log.Println("client error: Missing password field", r.RemoteAddr)
		return
	}

	user, err := db.GetUser(*userLogin.Email)
	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "User doesn't exist", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: getting user from db", err)
		// fmt.Println(err.Error())
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
		// fmt.Println(err)
		utils.Log.Println("cntrl error: creating jwt", err)
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

func ChangePassword(w http.ResponseWriter, r *http.Request) {

	r.Body = http.MaxBytesReader(w, r.Body, 1000000)
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Inacceptable content type", http.StatusBadRequest)
		utils.Log.Println("client error: invalid content type", r.RemoteAddr)
		return
	}
	userId := r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)

	user, err := db.GetUserById(userId)
	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "User doesn't exist", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: getting user from db", err)
		return
	}

	jDec := json.NewDecoder(r.Body)
	jDec.DisallowUnknownFields()
	var userChangePw types.UserChangePwInput
	statusCode, err := utils.JsonReqErrCheck(jDec.Decode(&userChangePw))
	if err != nil {
		http.Error(w, err.Error(), statusCode)
		utils.Log.Println("cntrl/client error: ", err)
		return
	}

	// if userChangePw.Email == nil {
	// 	http.Error(w, "Email field is empty", http.StatusBadRequest)
	// 	return
	// } else if *userChangePw.Email != *user.Email {
	// 	http.Error(w, "Email doesn't match", http.StatusUnauthorized)
	// 	return
	if userChangePw.OldPassword == nil {
		http.Error(w, "Old password field is empty", http.StatusBadRequest)
		return
	} else if !utils.AuthPassword(*user.Password, *userChangePw.OldPassword) {
		http.Error(w, "Old password doesn't match", http.StatusUnauthorized)
		utils.Log.Println("client error: Old password doesn't match", r.RemoteAddr)
		return
	} else if userChangePw.NewPassword == nil {
		http.Error(w, "New password field is empty", http.StatusBadRequest)
		utils.Log.Println("client error: Missing new password field", r.RemoteAddr)
		return
	} else if *userChangePw.NewPassword == *userChangePw.OldPassword {
		http.Error(w, "New password is same as old password", http.StatusBadRequest)
		return
	} else if utils.AuthPassword(*user.Password, *userChangePw.NewPassword) {
		http.Error(w, "New password is same as old password", http.StatusBadRequest)
		return
	}

	userNewPwHash, err := utils.HashPassword(*userChangePw.NewPassword, 10)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: hashing new password", err)
		return
	}

	err = db.UpdateUserPw(userId, userNewPwHash)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: updating user in db", err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func SearchUser(w http.ResponseWriter, r *http.Request) {
	// r.Body = http.MaxBytesReader(w, r.Body, 100000)
	// userEmail := chi.URLParam(r, "email")
	var userEmail string
	if userEmail = r.URL.Query().Get("email"); userEmail == "" {
		http.Error(w, "Email field is empty", http.StatusBadRequest)
		utils.Log.Println("client error: email field is empty", r.RemoteAddr)
		return
	}
	// if userEmail == "" {
	// 	http.Error(w, "Email field is empty", http.StatusBadRequest)
	// 	utils.Log.Println("client error: email field is empty", r.RemoteAddr)
	// 	return
	// }

	userId := r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)

	user, err := db.GetUser(userEmail)
	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "User doesn't exist", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: getting user from db", err)
		return
	}
	isContact := db.ContactExists(userId, *user.UserId)
	result := types.ContactSearch{UserId: *user.UserId, Name: *user.Name, Profile_Pic: *user.Profile_Pic, IsFriend: isContact}
	json.NewEncoder(w).Encode(result)
	// if contactExists := db.ContactExists(userId, userEmail); contactExists {
	// 	http.Error(w, "Contact already exists", http.StatusBadRequest)
	// 	utils.Log.Println("client error: contact already exists", r.RemoteAddr)
	// 	return
	// }

	// err := db.AddContact(userId, userEmail)
	// if err != nil {
	// 	http.Error(w, "Internal Server Error", http.StatusBadRequest)
	// 	utils.Log.Println("cntrl error: adding contact to db", err)
	// 	return
	// }

	// w.WriteHeader(http.StatusOK)
}

func AddContact(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 10000)
	userId := r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)

	jDec := json.NewDecoder(r.Body)
	jDec.DisallowUnknownFields()

	var contactId types.AddContactId
	statusCode, err := utils.JsonReqErrCheck(jDec.Decode(&contactId))

	if err != nil {
		http.Error(w, err.Error(), statusCode)
		utils.Log.Println("cntrl/client error: ", err)
		return
	} else if contactId.UserId == nil {
		http.Error(w, "Contact ID field is empty", http.StatusBadRequest)
		utils.Log.Println("client error: contactId field is empty", r.RemoteAddr)
		return
	} else if *contactId.UserId == userId {
		http.Error(w, "You cannot add yourself as a contact", http.StatusBadRequest)
		utils.Log.Println("client error: contact id is same as user id", r.RemoteAddr)
		return
	} else if db.ContactExists(userId, *contactId.UserId) {
		http.Error(w, "Contact already exists", http.StatusBadRequest)
		utils.Log.Println("client error: contact already exists", r.RemoteAddr)
		return
	}

	err = db.AddContact(userId, *contactId.UserId)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: adding contact to db", err)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// user, err := db.GetUser(userChangePw.Email)
// if err != nil {
// 	if err.Error() == "no rows in result set" {
// 		http.Error(w, "User doesn't exist", http.StatusNotFound)
// 		return
// 	}
// 	http.Error(w, "Internal Server Error", http.StatusBadRequest)
// 	utils.Log.Println("cntrl error: getting user from db", err)
// 	// fmt.Println(err.Error())
// 	return
// }
// trueUser := utils.AuthPassword(*user.Password, *userChangePw.OldPassword)
// if !trueUser {
// 	http.Error(w, "Incorrect password", http.StatusUnauthorized)
// 	return
// } else if *userChangePw.NewPassword == *user.Password {
// 	http.Error(w, "New password is same as old password", http.StatusBadRequest)
// 	return
// } else if *userChangePw.NewPassword == *userChangePw.OldPassword {
// 	http.Error(w, "New password is same as old password", http.StatusBadRequest)
// 	return
// }
// user.Password = userChangePw.NewPassword
