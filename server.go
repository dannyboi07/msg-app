package main

import (
	"bufio"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"regexp"
	"sync"
	"time"

	"net/http"

	"github.com/gabriel-vasile/mimetype"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	// "github.com/joho/godotenv"

	"msg-app/backend/controller"
	"msg-app/backend/db"
	"msg-app/backend/redis"
	"msg-app/backend/types"
	"msg-app/backend/utils"
	ws "msg-app/backend/websocket"

	"github.com/gorilla/websocket"
)

type Person struct {
	Name  string `json:"name,omitempty"`
	Phone int    `json:"phone,omitempty"`
}

// func hello(res http.ResponseWriter, req *http.Request) {
// 	fmt.Println(req.Context())
// 	res.WriteHeader(200)
// 	res.Write([]byte("hello world"))
// }
// func jsonHandler(res http.ResponseWriter, req *http.Request) {
// 	res.Header().Set("Content-Type", "application/json")
// 	res.WriteHeader(200)
// 	person := Person{"Daniel", 12345}
// 	json.NewEncoder(res).Encode(person)
// }
// -----BEGIN OPENSSH PRIVATE KEY-----
// 	b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABBDgTqeGD
// 	sV7pDz9eUhNkMuAAAAEAAAAAEAAACsAAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlz
// 	dHA1MjEAAACFBAEXxTIc0qMCSwFWEQQus+biuYwWDDXhzhzQJm6JruiCB4U9p5KUobPngE
// 	ymrRNH2xdITgg6TheLlPM7q11UbCxLqgCYQGXrXgoLLrI2qOG+YH6qhYukYoC04vpx2lbp
// 	SPT9oJjq3xcUTrngHdzTR/MYvzYsrY/kKwlxlIP/7H7IUPN9AQAAASCad8cjwqLW/etwj8
// 	2oPwjWCoP91RhD4oE/s5LVsqAwolqFO5CGJu86ycvxAg1C9oJFi6NOAbJ7kvbWHeoUVqvr
// 	IsCxEcMdGduhpaFTb/CbK6ybzLVlLsuMnUgaLE2WuPtWLLu299NI73s6mmSMuYwE6wUSvj
// 	D/ZOls4xJsPfFqUhMihL05o74EiWlAWPUHjROPcd4hpQGlGF1LEmSGJGTUPVA0Ah1jP2UN
// 	9qUFAuHreyfnphXyiaRkDBfG9IyzlS8G6UCe9/lQYlIx9FrQyBsVzxUE1f3XlHH+f2+OOw
// 	/rdGU0dnmcyq4i4rsgo6SbVr1ruecSAOozU5JMNqxOk/JUC7akP59IyEtdywGuELWn64F0
// 	UT5dpr+IJufp0XbZusw=
// 	-----END OPENSSH PRIVATE KEY-----
func main() {
	utils.InitLogger()

	// err := godotenv.Load(".env")
	// if err != nil {
	// 	utils.Log.Fatal("Error loading env vars")
	// }

	// privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	// if err != nil {
	// 	fmt.Printf("Cannot generate RSA key\n")
	// 	os.Exit(1)
	// }
	// publicKey := &privateKey.PublicKey

	// // dump private key to file
	// var privateKeyBytes []byte = x509.MarshalPKCS1PrivateKey(privateKey)
	// privateKeyBlock := &pem.Block{
	// 	Type:  "RSA PRIVATE KEY",
	// 	Bytes: privateKeyBytes,
	// }
	// privatePem, err := os.Create("private.pem")
	// if err != nil {
	// 	fmt.Printf("error when create private.pem: %s \n", err)
	// 	os.Exit(1)
	// }
	// err = pem.Encode(privatePem, privateKeyBlock)
	// if err != nil {
	// 	fmt.Printf("error when encode private pem: %s \n", err)
	// 	os.Exit(1)
	// }

	// // dump public key to file
	// publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	// if err != nil {
	// 	fmt.Printf("error when dumping publickey: %s \n", err)
	// 	os.Exit(1)
	// }
	// publicKeyBlock := &pem.Block{
	// 	Type:  "PUBLIC KEY",
	// 	Bytes: publicKeyBytes,
	// }
	// publicPem, err := os.Create("public.pem")
	// if err != nil {
	// 	fmt.Printf("error when create public.pem: %s \n", err)
	// 	os.Exit(1)
	// }
	// err = pem.Encode(publicPem, publicKeyBlock)
	// if err != nil {
	// 	fmt.Printf("error when encode public pem: %s \n", err)
	// 	os.Exit(1)
	// }

	privKeyFile, err := ioutil.ReadFile("../private.pem")
	if err != nil {
		log.Fatal("Error reading private key file")
	}
	pubKeyFile, err := ioutil.ReadFile("../public.pem")
	if err != nil {
		log.Fatal("Error reading public key file")
	}

	privateKeyPem, _ := pem.Decode(privKeyFile)
	publicKeyPem, _ := pem.Decode(pubKeyFile)

	privateKey, err := x509.ParsePKCS1PrivateKey(privateKeyPem.Bytes)
	if err != nil {
		log.Fatal("Error parsing private key PEM")
	}

	publicKey, err := x509.ParsePKIXPublicKey(publicKeyPem.Bytes)
	if err != nil {
		log.Fatal("Error parsing public key PEM")
	}

	utils.PrivKey = privateKey
	utils.PubKey = publicKey.(*rsa.PublicKey)
	// utils.PubKey = publicKey

	err = db.InitDB()
	redis.InitRedis()
	if err != nil {
		log.Fatal("Unable to connect to database: ", err.Error())
	}
	fmt.Println("Connected to database")
	defer db.CloseDB()

	ws.WsClients = &types.Clients{make(map[int64]*websocket.Conn), sync.RWMutex{}}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins: []string{"*"},
		AllowOriginFunc:  AllowOriginFunc,
		AllowedMethods:   []string{"GET", "POST", "DELETE"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}))
	r.Handle("/*", (http.StripPrefix("/static", http.FileServer(http.Dir("./static")))))
	r.Get("/hello", controller.Hello)

	r.Route("/test", func(r chi.Router) {
		r.Get("/", controller.GetPersons)
		r.Post("/", controller.PostPerson)
	})

	r.Route("/api", func(r chi.Router) {

		r.Group(func(r chi.Router) {
			r.Use(utils.AuthMiddleware)

			r.Get("/messages/{id}", controller.GetMsgs)
			r.Get("/contacts", controller.GetContacts)
			r.Get("/status/{id}", controller.GetOnline)
			r.Get("/ws", ws.Handler)
			r.Put("/changePw", controller.ChangePassword)
			r.Get("/searchUser", controller.SearchUser)
			r.Post("/addContact", controller.AddContact)

		})

		r.Group(func(r chi.Router) {
			r.Post("/register", controller.RegisterUser)
			r.Post("/login", controller.LoginUser)
			r.Get("/auth/logout", controller.LogoutUser)
			r.Post("/test", controller.TestToken)
			r.Get("/auth/refresh_token", controller.RefreshAccToken)
		})
	})

	// r.Route("/test", func(r chi.Router) {
	// 	r.Get("/", func(res http.ResponseWriter, req *http.Request) {
	// 		res.Header().Set("Content-Type", "application/json")
	// 		var persons = []Person{}
	// 		rows, err := dbPool.Query(context.Background(), "SELECT name, phone from test")
	// 		if err != nil {
	// 			if err.Error() != "no rows in result set" {
	// 				http.Error(res, "Server error while trying to process and respond to your request", http.StatusInternalServerError)
	// 			}
	// 			fmt.Println(err.Error())
	// 		}
	// 		defer rows.Close()
	// 		for rows.Next() {
	// 			var person = Person{}
	// 			err := rows.Scan(&person.Name, &person.Phone)
	// 			if err != nil {
	// 				http.Error(res, "Server error while trying to process and respond to your request", http.StatusInternalServerError)
	// 				return
	// 			}
	// 			fmt.Println(person)
	// 			persons = append(persons, person)
	// 		}
	// 		if rows.Err() != nil {
	// 			http.Error(res, "Server error while trying to process and respond to your request", http.StatusInternalServerError)
	// 			return
	// 		}
	// 		json.NewEncoder(res).Encode(persons)
	// 	})
	// 	r.Get("/{id}", func(res http.ResponseWriter, req *http.Request) {
	// 		idParam, idErr := strconv.Atoi(chi.URLParam(req, "id"))
	// 		if idErr != nil {
	// 			http.Error(res, "Invalid search parameter", http.StatusBadRequest)
	// 			return
	// 		}
	// 		res.Header().Set("Content-Type", "application/json")
	// 		var person = Person{}
	// 		err := dbPool.QueryRow(context.Background(), "SELECT name, phone from test WHERE t_id = $1", idParam).Scan(&person.Name, &person.Phone)
	// 		if err != nil {
	// 			if err.Error() != "no rows in result set" {
	// 				http.Error(res, "Server error while trying to process and respond to your request", http.StatusInternalServerError)
	// 			}
	// 			fmt.Println(err.Error())
	// 		}
	// 		json.NewEncoder(res).Encode(person)
	// 	})
	// })

	r.Post("/upload", uploadHandler)

	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal("Error starting server: ", err.Error())
	}
	// if err := http.ListenAndServeTLS(":8080", "public.pem", "private.pem", r); err != nil {
	// 	log.Fatal("Error starting server: ", err.Error())
	// }

	// dbConn, err := pgx.Connect(context.Background(), dbUrl)
	// dbPool, err := pgxpool.Connect(context.Background(), dbUrl)
	// r.Get("/json", func(res http.ResponseWriter, req *http.Request) {
	// 	res.Header().Set("Content-Type", "application/json")
	// 	person := Person{"Daniel", 12345}
	// 	json.NewEncoder(res).Encode(person)
	// })
	// err = http.ListenAndServe(":8080", r)
	// if err != nil {
	// 	log.Fatal("Error starting server: ", err.Error())
	// } else {
	// 	fmt.Println("Server started on port: 8080")
	// }
}

func AllowOriginFunc(r *http.Request, origin string) bool {
	if origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" {
		return true
	}
	return false
}

func uploadHandler(res http.ResponseWriter, req *http.Request) {
	fileTypeCheckRegExp := regexp.MustCompile("^image/jpeg|png|gif$|^video/mp4|mov$")
	var maxFileSize int64 = 1000 * 1000 * 13                           // 13 MB
	req.Body = http.MaxBytesReader(res, req.Body, maxFileSize+2000000) // Max req body size 15 MB
	// _, err := ioutil.ReadAll(req.Body)
	// if err != nil {
	// 	http.Error(res, err.Error(), http.StatusRequestEntityTooLarge)
	// 	return
	// }
	reader, err := req.MultipartReader()
	if err != nil {
		http.Error(res, err.Error(), http.StatusBadRequest)
		return
	}

	formField1, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(res, err.Error(), http.StatusBadRequest)
		return
	} else if fmt.Println("Formfield1: ", *formField1); formField1.FormName() != "Name" {
		http.Error(res, "Name field is expected", http.StatusBadRequest)
		return
	}
	field1 := make([]byte, 512)
	formField1.Read(field1)

	formField2, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(res, err.Error(), http.StatusBadRequest)
		return
	} else if fmt.Println("Formfield2: ", formField2); formField2.FormName() != "Phone" {
		http.Error(res, "Phone field is expected", http.StatusBadRequest)
		return
	}
	field2 := make([]byte, 512)
	formField2.Read(field2)

	formField3File, err := reader.NextPart()
	if err != nil && err != io.EOF {
		http.Error(res, err.Error(), http.StatusBadRequest)
		return
	}
	buf := bufio.NewReader(formField3File)
	sniff, _ := buf.Peek(512)
	// contentType := http.DetectContentType(sniff)
	// fmt.Println("ContentType: ", contentType, strings.Split(contentType, "/")[1]) strings.Split(contentType, "/")[1]
	fileContentType := mimetype.Detect(sniff)
	fmt.Println("mimeType:", fileContentType, fileContentType.Extension())
	if !fileTypeCheckRegExp.MatchString(fileContentType.String()) {
		http.Error(res, "File type not accepted. Images of type jpg, png and videos of type mp4, mov", http.StatusUnprocessableEntity)
		return
	}

	tempFile, err := ioutil.TempFile("uploads", time.Now().Format("2006-01-02-15:04:05")+"-*"+fileContentType.Extension())
	if err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tempFile.Close()

	var maxSize int64 = maxFileSize
	lmt := io.MultiReader(buf, io.LimitReader(formField3File, maxSize-511))
	written, err := io.Copy(tempFile, lmt)
	if err != nil && err != io.EOF {
		os.Remove(tempFile.Name())
		if err.Error() == "http: request body too large" {
			http.Error(res, err.Error(), http.StatusRequestEntityTooLarge)
			return
		}
		http.Error(res, err.Error(), http.StatusInternalServerError)
		return
	} else if written > maxSize {
		os.Remove(tempFile.Name())
		http.Error(res, "File size over limit", http.StatusRequestEntityTooLarge)
		return
	}
	fmt.Println("field1", field1, "field2", string(field2))
	res.WriteHeader(http.StatusOK)
	json.NewEncoder(res).Encode(field1)
	json.NewEncoder(res).Encode(field2)
}
