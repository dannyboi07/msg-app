package controller

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"msg-app/backend/db"
	"msg-app/backend/redis"
	"msg-app/backend/types"
	"msg-app/backend/utils"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gabriel-vasile/mimetype"
	"github.com/golang-jwt/jwt/v4"
)

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var maxFileSize int64 = 1000 * 1000 * 2
	r.Body = http.MaxBytesReader(w, r.Body, maxFileSize+2000000)
	if !strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		http.Error(w, "Invalid content type", http.StatusBadRequest)
		return
	}

	var (
		reader *multipart.Reader
		err    error
	)
	reader, err = r.MultipartReader()
	if err != nil {
		http.Error(w, "Interval Server Error", http.StatusInternalServerError)
		utils.Log.Println("cntrl error: initing multipart reader", err)
		return
	}

	// Section: Validate name
	var nameField *multipart.Part

	nameField, err = reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		utils.Log.Println("client error: nextPart:nameField", err, r.RemoteAddr)
		return
	} else if nameField.FormName() != "name" {
		http.Error(w, "Expected missing field: name", http.StatusBadRequest)
		utils.Log.Println("client error: 'name' field name not found", r.RemoteAddr)
		return
	}

	var name string = utils.ReadPartToString(nameField)
	if !utils.ValidName(&name) {
		http.Error(w, "Invalid name, must be greater than 3 and consist of only alphabetic characters", http.StatusBadRequest)
		return
	}

	// Section: Validate email
	var emailPart *multipart.Part
	emailPart, err = reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		utils.Log.Println("client error: nextPart:emailField", err, r.RemoteAddr)
		return
	} else if emailPart.FormName() != "email" {
		http.Error(w, "Expected missing field: email", http.StatusBadRequest)
		utils.Log.Println("client error: 'email' field name not found", r.RemoteAddr)
		return
	}

	var email string = utils.ReadPartToString(emailPart)
	var userExists bool
	userExists, err = db.UserExists(&email)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		utils.Log.Println("cntrl error: getting user details from db", err)
		return
	}

	if userExists {
		http.Error(w, "User already exists, try \"Forgot Password\" if you've forgotten your password to recover", http.StatusConflict)
		return
	}

	// Section: Validate password
	var passwordField *multipart.Part

	passwordField, err = reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, "Missing field: password", http.StatusBadRequest)
		utils.Log.Println("client error: nextPart:password", err, r.RemoteAddr)
		return
	} else if passwordField.FormName() != "password" {
		http.Error(w, "Missing field: password", http.StatusBadRequest)
		utils.Log.Println("client error: 'password' field name not found", r.RemoteAddr)
		return
	}
	var password string = utils.ReadPartToString(passwordField)

	// Section: Validate profile picture
	var profilePic *multipart.Part

	profilePic, err = reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		utils.Log.Println("cntrl error: ", err)
		return
	} else if err == io.EOF {
		var hashedPw string
		hashedPw, err = utils.HashPassword(password, 10)
		if err != nil {
			http.Error(w, "Interval Server Error", http.StatusInternalServerError)
			utils.Log.Println("cntrl error: hashing password", err)
			return
		}

		var picStr string = ""
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
		var (
			validFile bool
			buf       *bufio.Reader
			fileMime  *mimetype.MIME
		)
		validFile, buf, fileMime = utils.ValidFileType(profilePic, &utils.ProfImgValRegEx)
		if !validFile {
			http.Error(w, "Unacceptable file type", http.StatusUnprocessableEntity)
			utils.Log.Println("client error: 'Invalid prof-pic file type'", r.RemoteAddr)
			return
		}

		var (
			statusInt int
			err       error
			fileLink  string
		)
		fileLink, statusInt = utils.S3FileUpload(buf, profilePic, "profile-images/", fileMime, maxFileSize)
		switch statusInt {
		case 0:
			break
		case 413:
			http.Error(w, "Profile picture is too large, max size of 2MB", statusInt)
			utils.Log.Println("client err: Profile picture over file size limit", r.RemoteAddr)
			return
		case 500:
			http.Error(w, "Internal server error", statusInt)
			utils.Log.Println("cntrl err:", r.RemoteAddr)
			return
		}

		var hashedPw string
		hashedPw, err = utils.HashPassword(password, 10)
		if err != nil {
			http.Error(w, "Interval Server Error", http.StatusInternalServerError)
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

	// Validate JSON containing user details
	var (
		userLogin  types.UserLoginInput
		statusCode int
		err        error
	)
	statusCode, err = utils.JsonReqErrCheck(jDec.Decode(&userLogin))
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

	// Get users's deets from DB by email
	var user types.UserWithId
	user, err = db.GetUser(*userLogin.Email)
	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "User doesn't exist", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: getting user from db", err)
		return
	}

	// Validate password
	var trueUser bool = utils.AuthPassword(*user.Password, *userLogin.Password)
	if !trueUser {
		http.Error(w, "Incorrect password", http.StatusUnauthorized)
		return
	}
	fmt.Println("name", *user.Name, "email", *user.Email, "id", *user.UserId, "userprof", *user.Profile_Pic)

	// Create struct for user's token
	userForToken := types.UserForToken{UserId: *user.UserId, Email: *user.Email}
	var (
		accToken string
		accTkExp int
	)
	accToken, accTkExp, err = utils.CreateJwt(userForToken)
	if err != nil {
		http.Error(w, "Internal Server Error, try again", http.StatusInternalServerError)
		utils.Log.Println("cntrl error: creating jwt", err)
		return
	}

	var (
		refToken string
		refTkExp time.Duration
	)
	refToken, refTkExp, err = utils.CreateRefreshJwt(userForToken)
	if err != nil {
		http.Error(w, "Interval Server Error, try again", http.StatusInternalServerError)
		utils.Log.Println("cntrl err: creating ref tk", err)
		return
	}

	// SET refresh token in Redis with EXPIRY (7 days)
	err = redis.SetRefToken(strconv.Itoa(int(*user.UserId))+"-"+"refTk", refToken, refTkExp)
	if err != nil {
		http.Error(w, "Internal Server Error, try again", http.StatusInternalServerError)
		utils.Log.Println("cntrl err: Setting redis ref tk", err)
		return
	}

	var (
		accTkCookie *http.Cookie
		refTkCookie *http.Cookie
	)
	accTkCookie = &http.Cookie{Name: "accessToken", Value: accToken, MaxAge: accTkExp, Path: "/api", HttpOnly: true}
	refTkCookie = &http.Cookie{Name: "refreshToken", Value: refToken, MaxAge: int(refTkExp.Seconds()), Path: "/api/auth", HttpOnly: true}
	http.SetCookie(w, accTkCookie)
	http.SetCookie(w, refTkCookie)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func LogoutUser(w http.ResponseWriter, r *http.Request) {

	var (
		accTkCookie *http.Cookie
		err         error
	)
	accTkCookie, err = r.Cookie("accessToken")

	// If access token cookie didn't expire by MAX AGE, access it and mark it for deletion
	if err == nil {
		accTkCookie.MaxAge = -1
		accTkCookie.Path = "/api"
		http.SetCookie(w, accTkCookie)
	}

	var refTkCookie *http.Cookie
	refTkCookie, err = r.Cookie("refreshToken")
	if err == nil {
		var mapClaims jwt.MapClaims
		mapClaims, err, _ := utils.VerifyUserToken(refTkCookie.Value)
		if err == nil || err != nil && err.Error() == "Token expired" {
			redis.DelRefToken(strconv.Itoa(int(mapClaims["UserId"].(float64))) + "-" + "refTk")
		}

		refTkCookie.MaxAge = -1
		refTkCookie.Path = "/api/auth"

		http.SetCookie(w, refTkCookie)
	}
	w.WriteHeader(http.StatusOK)
}

func ChangePassword(w http.ResponseWriter, r *http.Request) {

	r.Body = http.MaxBytesReader(w, r.Body, 1000000)
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Inacceptable content type", http.StatusBadRequest)
		utils.Log.Println("client error: invalid content type", r.RemoteAddr)
		return
	}

	var userId int64 = r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)

	var (
		user types.UserWithId
		err  error
	)
	user, err = db.GetUserById(userId)
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

	var (
		userChangePw types.UserChangePwInput
		statusCode   int
	)
	statusCode, err = utils.JsonReqErrCheck(jDec.Decode(&userChangePw))
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
		http.Error(w, "Old password is required", http.StatusBadRequest)
		return
	} else if !utils.AuthPassword(*user.Password, *userChangePw.OldPassword) {
		http.Error(w, "Wrong Password", http.StatusUnauthorized)
		utils.Log.Println("client error: Wrong Password", r.RemoteAddr)
		return
	} else if userChangePw.NewPassword == nil {
		http.Error(w, "New password field is empty", http.StatusBadRequest)
		utils.Log.Println("client error: Missing new password field", r.RemoteAddr)
		return
	} else if *userChangePw.NewPassword == *userChangePw.OldPassword {
		http.Error(w, "New password is the same as old password", http.StatusBadRequest)
		return
	} else if utils.AuthPassword(*user.Password, *userChangePw.NewPassword) {
		http.Error(w, "New password is the same as old password", http.StatusBadRequest)
		return
	}

	var userNewPwHash string
	userNewPwHash, err = utils.HashPassword(*userChangePw.NewPassword, 10)
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

func ChangeDP(w http.ResponseWriter, r *http.Request) {
	var maxFileSize int = 2000000
	r.Body = http.MaxBytesReader(w, r.Body, int64(maxFileSize))

	var (
		reader *multipart.Reader
		err    error
	)
	reader, err = r.MultipartReader()
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		utils.Log.Println("cntrl err: ", err)
		return
	}

	var profilePic *multipart.Part
	profilePic, err = reader.NextPart()
	if err != nil {
		if err != io.EOF {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			utils.Log.Println("cntrl err", err)
			return
		}
		http.Error(w, "Profile picture not present", http.StatusBadRequest)
		utils.Log.Println("client err: Missing profile picture")
		return

	} else if profilePic.FormName() != "profilePic" {
		http.Error(w, "Unrecognized form field", http.StatusBadRequest)
		utils.Log.Println("client err: Unrecognized form field")
		return
	}

	var (
		validFile bool
		buf       *bufio.Reader
		fileType  *mimetype.MIME
	)
	validFile, buf, fileType = utils.ValidFileType(profilePic, &utils.ProfImgValRegEx)
	if !validFile {
		http.Error(w, "Unacceptable file type", http.StatusUnprocessableEntity)
		utils.Log.Println("client error: 'Invalid prof-pic file type'", r.RemoteAddr)
		return
	}

	var (
		fileLink  string
		statusInt int
	)
	fileLink, statusInt = utils.S3FileUpload(buf, profilePic, "profile-images/", fileType, int64(maxFileSize))
	switch statusInt {
	case 0:
		break
	case 413:
		http.Error(w, "Profile picture is too large, max size of 2MB", statusInt)
		utils.Log.Println("cntrl err: Uploading prof img to s3")
		return
	case 500:
		http.Error(w, "Internal server error", statusInt)
		utils.Log.Println("cntrl err: uploading changed profile picture to s3")
		return
	}

	var userId int64 = r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)
	err = db.UpdateUserDP(userId, fileLink)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		utils.Log.Println("db err: ", err)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(types.UserProfileLink{ProfileImgLink: fileLink})
}

func SearchUser(w http.ResponseWriter, r *http.Request) {
	var userEmail string
	if userEmail = r.URL.Query().Get("email"); userEmail == "" {
		http.Error(w, "Email field is empty", http.StatusBadRequest)
		utils.Log.Println("client error: email field is empty", r.RemoteAddr)
		return
	}

	var userId int64 = r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)

	var (
		user types.UserWithId
		err  error
	)
	user, err = db.GetUser(userEmail)
	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "User doesn't exist", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusBadRequest)
		utils.Log.Println("cntrl error: getting user from db", err)
		return
	}

	var isContact bool = db.ContactExists(userId, *user.UserId)
	result := types.ContactSearch{UserId: *user.UserId, Name: *user.Name, Profile_Pic: *user.Profile_Pic, IsFriend: isContact}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func AddContact(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 10000)
	var userId int64 = r.Context().Value("userDetails").(jwt.MapClaims)["UserId"].(int64)

	jDec := json.NewDecoder(r.Body)
	jDec.DisallowUnknownFields()

	var (
		contactId  types.AddContactId
		statusCode int
		err        error
	)
	statusCode, err = utils.JsonReqErrCheck(jDec.Decode(&contactId))

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

func RefreshAccToken(w http.ResponseWriter, r *http.Request) {

	var (
		refreshToken *http.Cookie
		err          error
	)
	refreshToken, err = r.Cookie("refreshToken")
	if err != nil {
		http.Error(w, "Missing refresh token", http.StatusForbidden)
		utils.Log.Println("client error: refresh token missing", r.RemoteAddr)
		return
	}

	var (
		mapClaims jwt.MapClaims
		statusInt int
	)
	mapClaims, err, statusInt = utils.VerifyUserToken(refreshToken.Value)
	if err != nil {
		http.Error(w, err.Error(), statusInt)
		utils.Log.Println("client/server err:", err, r.RemoteAddr)
		return
	}

	// Check if user exists
	var exists bool
	exists, err = db.UserExistsById(int64(mapClaims["UserId"].(float64)))
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		utils.Log.Println("ref token err: getting user from db", err)
		return
	} else if !exists {
		http.Error(w, "User doesn't exist", http.StatusUnauthorized)
		utils.Log.Println("client err: user doesn't exist", r.RemoteAddr)
		return
	}

	// Format a keystring for redis
	var refTkKey string = strconv.FormatInt(int64(mapClaims["UserId"].(float64)), 10) + "-" + "refTk"
	var refTokenExists bool = redis.RefTokenExists(refTkKey, refreshToken.Value)
	if !refTokenExists {
		http.Error(w, "Unauthorized refresh token", http.StatusUnauthorized)
		utils.Log.Println("client err: refresh token not found", r.RemoteAddr)
		return
	}

	userDetails := types.UserForToken{UserId: int64(mapClaims["UserId"].(float64)), Email: mapClaims["Email"].(string)}
	var (
		newRefToken string
		refTkExp    time.Duration
	)
	newRefToken, refTkExp, err = utils.CreateRefreshJwt(userDetails)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		utils.Log.Println("server err: creating ref token")
		return
	}

	err = redis.SetRefToken(refTkKey, newRefToken, refTkExp)
	if err != nil {
		http.Error(w, "Interval Server Error", http.StatusInternalServerError)
		utils.Log.Println("server err: error setting redis ref tk")
		return
	}

	var (
		newAccToken string
		accTkExp    int
	)
	newAccToken, accTkExp, err = utils.CreateJwt(userDetails)
	if err != nil {
		http.Error(w, "Interval Server Error", http.StatusInternalServerError)
		utils.Log.Println("cntrl err: error creating acc tk", err)
		redis.DelRefToken(refTkKey)
		return
	}

	accTkCookie := &http.Cookie{Name: "accessToken", Value: newAccToken, MaxAge: accTkExp, Path: "/api", HttpOnly: true}
	rekTkCookie := &http.Cookie{Name: "refreshToken", Value: newRefToken, MaxAge: int(refTkExp.Seconds()), Path: "/api/auth", HttpOnly: true}

	http.SetCookie(w, accTkCookie)
	http.SetCookie(w, rekTkCookie)

	w.WriteHeader(http.StatusOK)
}
