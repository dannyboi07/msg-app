package controller

import (
	"encoding/json"
	"fmt"
	"msg-app/backend/db"
	"msg-app/backend/types"
	"msg-app/backend/utils"
	"net/http"
)

// type Person struct {
// 	Name  string `json:"name,omitempty"`
// 	Phone int    `json:"phone,omitempty"`
// }

func TestToken(w http.ResponseWriter, r *http.Request) {
	type tokenS struct {
		Token *string `json:"token"`
	}
	var token tokenS
	jDec := json.NewDecoder(r.Body)
	statusCode, err := utils.JsonReqErrCheck(jDec.Decode(&token))
	if err != nil {
		fmt.Println(err.Error(), statusCode)
		return
	}
	valid, err, statusCode := utils.VerifyUserToken(*token.Token)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Println(valid["Email"], valid["UserId"])
	json.NewEncoder(w).Encode(valid)
}

func GetPersons(res http.ResponseWriter, req *http.Request) {
	res.Header().Set("Content-Type", "application/json")
	rows, err := db.Persons()
	if err != nil {
		http.Error(res, "Server error while processing and responding to request", http.StatusInternalServerError)
		return
	}
	var Persons []types.Person
	for rows.Next() {
		var person types.Person
		err := rows.Scan(&person.Name, &person.Phone)
		if err != nil {
			http.Error(res, "Server error while processing and responding to request", http.StatusInternalServerError)
			return
		}

		Persons = append(Persons, person)
	}
	json.NewEncoder(res).Encode(Persons)
}

func PostPerson(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Only JSON requests accepted", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	var person types.Person
	r.Body = http.MaxBytesReader(w, r.Body, 1000000)

	jDec := json.NewDecoder(r.Body)
	jDec.DisallowUnknownFields()
	statusCode, err := utils.JsonReqErrCheck(jDec.Decode(&person))
	if err != nil {
		http.Error(w, err.Error(), statusCode)
		return
	}
	fmt.Println(person, *person.Name, *person.Phone)
	err = utils.ValidPerson(person)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println(person, *person.Name, *person.Phone)
	err = db.InsertPerson(&person)
	if err != nil {
		fmt.Println(err.Error())
	}
	json.NewEncoder(w).Encode(person)
	// vOfPerson := reflect.ValueOf(person)
	// typeOfPerson := vOfPerson.Type()

	// for i := 0; i < typeOfPerson.NumField(); i++ {
	// 	temp := vOfPerson.Field(i).Interface()
	// 	fmt.Println("Field: ", typeOfPerson.Field(i).Name, temp, temp == nil)
	// }
	// personFields := reflect.VisibleFields(reflect.TypeOf(person))
	// for _, field := range personFields {
	// 	fmt.Println("Key: ", field.Name, ", Type: ", field.Type)
	// }

	// err, statusInt := utils.DecodeJsonBody(w, r, &person)
	// fmt.Println(person)
	// if err != nil {
	// 	http.Error(w, err.Error(), statusInt)
	// 	return
	// }
	// fmt.Fprintf(w, "Status: OK, %v", person)

	// b, err := ioutil.ReadAll(r.Body)
	// defer r.Body.Close()
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	// err = json.Unmarshal(b, &person)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }
	// fmt.Println(person)
	// json.NewEncoder(w).Encode(person)
}

// func GetPerson(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Content-Type", "application/json")
// 	row, err := db.SelectAPerson()
// 	if err != nil {
// 		http.Error(w, "Server error", http.StatusInternalServerError)
// 		return
// 	}
// 	var person types.Person
// 	utils.ProcessDbRow(&row, person)
// 	json.NewEncoder(w).Encode(person)
// }

// func PostPerson(res http.ResponseWriter, req *http.Request) {
// 	var personDetails types.Person
// 	err, statusCode := utils.DecodeJsonBody(res, req, &personDetails)
// 	if err != nil {
// 		http.Error(res, err.Error(), statusCode)
// 		return
// 	}
// 	row, err := db.InsertPerson(&personDetails)

// }

// func GetPersons(res http.ResponseWriter, req *http.Request) {
// 	res.Header().Set("Content-Type", "application/json")
// 	var persons = []Person{}
// 	rows, err := dbPool.Query(context.Background(), "SELECT name, phone from test")
// 	if err != nil {
// 		if err.Error() != "no rows in result set" {
// 			http.Error(res, "Server error while trying to process and respond to your request", http.StatusInternalServerError)
// 		}
// 		fmt.Println(err.Error())
// 	}

// 	defer rows.Close()
// 	for rows.Next() {
// 		var person = Person{}
// 		err := rows.Scan(&person.Name, &person.Phone)
// 		if err != nil {
// 			http.Error(res, "Server error while trying to process and respond to your request", http.StatusInternalServerError)
// 			return
// 		}
// 		fmt.Println(person)
// 		persons = append(persons, person)
// 	}
// 	if rows.Err() != nil {
// 		http.Error(res, "Server error while trying to process and respond to your request", http.StatusInternalServerError)
// 		return
// 	}

// 	json.NewEncoder(res).Encode(persons)
// }
