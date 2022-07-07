package utils

import (
	"bufio"
	"bytes"
	"crypto/rsa"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	stdlog "log"
	"mime/multipart"
	"msg-app/backend/types"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/gabriel-vasile/mimetype"
	"github.com/jackc/pgx/v4"

	"github.com/golang-jwt/jwt/v4"
)

var Log stdlog.Logger

// var LogErr stdlog.Logger

// var LogFatal stdlog.Logger

var ProfImgValRegEx regexp.Regexp = *regexp.MustCompile("^image/jpg|jpeg|png|heif|heic|gif$")
var NameValRegEx regexp.Regexp = *regexp.MustCompile(`^[\p{L}\p{M} .'-]+$`)
var EmailValRegEx regexp.Regexp = *regexp.MustCompile("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b")
var PrivKey *rsa.PrivateKey
var PubKey *rsa.PublicKey

func InitLogger() {
	Log = *stdlog.New(os.Stdout, "Log: ", stdlog.Lshortfile|stdlog.LUTC)
	// LogErr = *stdlog.New(os.Stderr, "logErr: ", stdlog.Lshortfile|stdlog.LUTC)
}

func ValidName(name *string) bool {
	if *name = strings.TrimSpace(*name); len(*name) < 3 {
		return false
	} else if !NameValRegEx.MatchString(*name) {
		return false
	}
	return true
}

func DecodeJsonBody(w http.ResponseWriter, r *http.Request, dataType interface{}) (error, int) {
	if r.Header.Get("Content-Type") != "application/json" {
		// http.Error(w, "Only JSON requests accepted", http.StatusBadRequest)
		return errors.New("Only JSON requests accepted"), http.StatusBadRequest
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1000000)

	jDec := json.NewDecoder(r.Body)
	jDec.DisallowUnknownFields()

	err := jDec.Decode(&dataType)
	if err != nil {
		var syntaxError *json.SyntaxError
		var unMarshallTypeError *json.UnmarshalTypeError

		switch {
		case errors.As(err, &syntaxError):
			return errors.New(fmt.Sprintf("Request body contains badly-formed JSON (at position %d)", syntaxError.Offset)), http.StatusBadRequest

		case errors.Is(err, io.ErrUnexpectedEOF):
			return errors.New(fmt.Sprintf("Request body contains badly formed JSON")), http.StatusBadRequest

		case errors.As(err, &unMarshallTypeError):
			return errors.New(fmt.Sprintf("Request body contains an invalid value for field: %q (at position: %d)", unMarshallTypeError.Field, unMarshallTypeError.Offset)), http.StatusBadRequest

		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			return errors.New(fmt.Sprintf("Request body contains unknown field %s", fieldName)), http.StatusBadRequest

		case errors.Is(err, io.EOF):
			return errors.New("Request body cannot be empty"), http.StatusBadRequest

		case err.Error() == "http: request body too large":
			return errors.New("Request body cannot be larger than 1MB"), http.StatusRequestEntityTooLarge

		default:
			return err, http.StatusBadRequest
		}
	}
	err = jDec.Decode(&struct{}{})
	if err != io.EOF {
		return errors.New("Request body must only contain single JSON object"), http.StatusBadRequest
	}
	return nil, 0
}

func JsonReqErrCheck(err error) (int, error) {
	if err != nil {
		var syntaxError *json.SyntaxError
		var unMarshallTypeError *json.UnmarshalTypeError

		switch {
		case errors.As(err, &syntaxError):
			return http.StatusBadRequest, errors.New(fmt.Sprintf("Request body contains badly-formed JSON (at position %d)", syntaxError.Offset))

		case errors.Is(err, io.ErrUnexpectedEOF):
			return http.StatusBadRequest, errors.New(fmt.Sprintf("Request body contains badly formed JSON"))

		case errors.As(err, &unMarshallTypeError):
			return http.StatusBadRequest, errors.New(fmt.Sprintf("Request body contains an invalid value for field: %q (at position: %d)", unMarshallTypeError.Field, unMarshallTypeError.Offset))

		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			return http.StatusBadRequest, errors.New(fmt.Sprintf("Request body contains unknown field %s", fieldName))

		case errors.Is(err, io.EOF):
			return http.StatusBadRequest, errors.New("Request body cannot be empty")

		case err.Error() == "http: request body too large":
			return http.StatusRequestEntityTooLarge, errors.New("Request body cannot be larger than 1MB")

		default:
			return http.StatusBadRequest, err
		}
	}
	return 0, nil
}

func ProcessDbRow(rows *pgx.Rows, dataType interface{}) (interface{}, error) {
	// var newDataType = dataType
	defer (*rows).Close()
	for (*rows).Next() {
		err := (*rows).Scan(&dataType)
		if err != nil {
			return nil, err
		}
	}
	return dataType, nil
}

func ValidPerson(person types.Person) error {
	if person.Name == nil || person.Phone == nil {
		return errors.New("A valid name and phone number is required")
	} else if *person.Name = strings.TrimSpace(*person.Name); len(*person.Name) == 0 {
		return errors.New("Name is invalid")
	} else if len(strconv.Itoa(*person.Phone)) < 5 {
		return errors.New("Phone number must be of 10 numbers")
	}
	return nil
}

func ValidFileType(file *multipart.Part, fileExtType *regexp.Regexp) (bool, *bufio.Reader, *mimetype.MIME) {
	buf := bufio.NewReader(file)
	sniff, _ := buf.Peek(512)

	fileContentType := mimetype.Detect(sniff)
	if fileExtType.MatchString(fileContentType.String()) {
		return true, buf, fileContentType
	} else {
		return false, nil, nil
	}
}

func ReadPartToString(multiPart *multipart.Part) string {
	// fieldPart, err := multiPart
	buf := bytes.NewBuffer(nil)
	buf.ReadFrom(multiPart)
	// fmt.Println(buf, buf.String(), multiPart)
	return buf.String()
	// _, err := io.Copy(buf, multiPart)
	// if err != nil {
	// 	fmt.Print(buf.String(), buf)
	// 	return "", err
	// }
	// return buf.String(), nil
}

func FileUpload(file *multipart.Part, buf *bufio.Reader, dir string, ext *mimetype.MIME, maxFileSize int64) (int, error, string) {
	timeNow := time.Now().Format("2006-01-02-15-04-05")
	// fileLink := "http://localhost:8080/" + dir + timeNow + "-*" + ext.Extension()
	tempFile, err := ioutil.TempFile(dir, timeNow+"-*"+ext.Extension())
	if err != nil {
		return http.StatusInternalServerError, err, ""
	}
	defer tempFile.Close()
	lmt := io.MultiReader(buf, io.LimitReader(file, maxFileSize-511))
	written, err := io.Copy(tempFile, lmt)
	if err != nil && err != io.EOF {
		os.Remove(tempFile.Name())
		if err.Error() == "http: request body too large" {
			return http.StatusRequestEntityTooLarge, err, ""
		}
		return http.StatusInternalServerError, err, ""
	} else if written > maxFileSize {
		os.Remove(tempFile.Name())
		return http.StatusRequestEntityTooLarge, err, ""
	}
	return 0, nil, "http://localhost:8080/" + tempFile.Name()
}

func HashPassword(password string, cost int) (string, error) {
	hashedPw, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil {
		return "", err
	}
	return string(hashedPw), nil
}

func AuthPassword(hashedPassword string, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false
	}
	return true
}

type CustomClaims struct {
	*jwt.RegisteredClaims
	types.UserForToken
}

func CreateJwt(userDetails types.UserForToken) (string, int, error) {
	token := jwt.New(jwt.GetSigningMethod("RS256"))
	createdTime := time.Now()
	expireTime := createdTime.Add(time.Minute * 15)
	// var expireTime int64 = 3600
	token.Claims = &CustomClaims{
		// &jwt.StandardClaims{
		// 	ExpiresAt: expireTime,
		// },
		&jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
		},
		userDetails,
	}
	signedToken, err := token.SignedString(PrivKey)
	if err != nil {
		return "", 0, err
	} //int(expireTime.Sub(createdTime).Seconds())
	// Log.Println(int(expireTime.Sub(createdTime)), expireTime.Sub(createdTime))
	return signedToken, int(expireTime.Sub(createdTime).Seconds()), nil
}

func VerifyUserToken(token string) (jwt.MapClaims, error, int) {
	// pubKey, err := jwt.ParseRSAPublicKeyFromPEM()
	// if err != nil {
	// 	fmt.Println("pubkey err", err)
	// 	return false, err
	// }
	parsedToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		// if _, ok := parsedToken.Method.(*jwt.SigningMethodES256); !ok {
		// 	return nil, fmt.Errorf("Unexpected signing method: %v", parsedToken.Header["alg"])
		// }

		return PubKey, nil
	})

	if parsedToken.Valid {
		return parsedToken.Claims.(jwt.MapClaims), nil, http.StatusOK
	} else if ve, ok := err.(*jwt.ValidationError); ok {
		if ve.Errors&jwt.ValidationErrorMalformed != 0 {
			fmt.Println("Malformed token")
			return nil, errors.New("Malformed Token"), http.StatusBadRequest
		} else if ve.Errors&(jwt.ValidationErrorExpired|jwt.ValidationErrorNotValidYet) != 0 {
			// Token is either expired or not active yet
			//fmt.Println("Token expired")
			return nil, errors.New("Token expired"), http.StatusUnauthorized
		} else {
			fmt.Println("Couldn't handle this token:", err)
			return nil, err, http.StatusInternalServerError
		}
	} else {
		fmt.Println("Couldn't handle this token:", err)
		return nil, err, http.StatusInternalServerError
	}
}

func CreateRefreshJwt(userDetails types.UserForToken) (string, time.Duration, error) {
	refreshToken := jwt.New(jwt.GetSigningMethod("RS256"))
	createdTime := time.Now()
	expireTime := createdTime.AddDate(0, 0, 7)

	refreshToken.Claims = &CustomClaims{
		&jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
		},
		userDetails,
	}
	signedToken, err := refreshToken.SignedString(PrivKey)
	if err != nil {
		return "", 0, err
	}

	return signedToken, expireTime.Sub(createdTime), nil
}
