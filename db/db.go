package db

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"msg-app/backend/types"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)

var db *pgxpool.Pool
var dbContext context.Context

// var dbUname = os.Getenv("DB_UNAME")
// var dbPwd = os.Getenv("DB_PWD")

// var dbUrl string = os.Getenv("DB_URL") + "/test"

func InitDB() error {
	dbContext = context.Background()
	var err error
	// fmt.Println("dbUrl", dbUrl, "dbUname", dbUname, "dbPwd", dbPwd)
	db, err = pgxpool.Connect(dbContext, "postgres://"+os.Getenv("DB_UNAME")+":"+os.Getenv("DB_PWD")+"@localhost:5432/"+os.Getenv("DB_NAME"))
	if err != nil {
		return err
	}
	return nil
}

func CloseDB() {
	db.Close()
}

func AllPersons() ([]types.Person, error) {
	rows, err := db.Query(dbContext, "SELECT name, phone FROM test")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var Persons []types.Person
	for rows.Next() {
		var person types.Person
		err := rows.Scan(&person.Name, &person.Phone)
		if err != nil {
			return nil, err
		}

		Persons = append(Persons, person)
	}

	if rows.Err() != nil {
		return nil, err
	}

	return Persons, nil
}

func Persons() (pgx.Rows, error) {
	rows, err := db.Query(dbContext, "SELECT name, phone FROM test")
	if err != nil {
		return nil, err
	}
	return rows, nil
}

func InsertPerson(newPerson *types.Person) error {
	fmt.Println("Inserting")
	commandTag, err := db.Exec(dbContext, "INSERT INTO test (name, phone) VALUES ($1, $2)", *newPerson.Name, *newPerson.Phone)
	if err != nil {
		return err
	} else if commandTag.RowsAffected() != 1 {
		return errors.New("Failed to create a new person, try again")
	}
	return nil
}

func InsertUser(newUser *types.User) error {
	if *newUser.Profile_Pic != "" {
		commandTag, err := db.Exec(dbContext, "INSERT INTO users (name, email, profile_pic, password_hash) VALUES ($1, $2, $3, $4)", newUser.Name, newUser.Email, newUser.Profile_Pic, newUser.Password)
		if err != nil {
			return err
		} else if commandTag.RowsAffected() != 1 {
			return errors.New("Failed to create a new person, try again")
		}
	} else {
		commandTag, err := db.Exec(dbContext, "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)", newUser.Name, newUser.Email, newUser.Password)
		if err != nil {
			return err
		} else if commandTag.RowsAffected() != 1 {
			return errors.New("Failed to create a new person, try again")
		}
	}
	return nil
}

func UserExists(userEmail *string) (bool, error) {
	var exists bool
	row := db.QueryRow(dbContext, "SELECT EXISTS(SELECT * FROM users WHERE email = $1)", *userEmail)
	err := row.Scan(&exists)

	// var ran interface{}
	// row2 := db.QueryRow(dbContext, "SELECT EXISTS(SELECT * FROM users WHERE email = $1)", *userEmail)
	// err2 := row2.Scan(ran)
	// // fmt.Println(ran)
	// if err2 == nil {
	// 	fmt.Println(ran, *userEmail)
	// }
	if err != nil {
		return false, err
	}
	return exists, nil
}

func GetUser(userEmail string) (types.UserWithId, error) {
	var user types.UserWithId
	row := db.QueryRow(dbContext, "SELECT user_id, name, email, profile_pic, password_hash FROM users WHERE email = $1", userEmail)
	err := row.Scan(&user.UserId, &user.Name, &user.Email, &user.Profile_Pic, &user.Password)
	if err != nil {
		return user, err
	}
	return user, nil
}

func UserExistsById(userId int64) (bool, error) {
	var exists bool
	row := db.QueryRow(dbContext, "SELECT EXISTS(SELECT user_id from users WHERE user_id = $1)", userId)
	err := row.Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func GetUserById(userId int64) (types.UserWithId, error) {
	var user types.UserWithId
	row := db.QueryRow(dbContext, "SELECT user_id, name, email, profile_pic, password_hash FROM users WHERE user_id = $1", userId)
	err := row.Scan(&user.UserId, &user.Name, &user.Email, &user.Profile_Pic, &user.Password)
	if err != nil {
		return user, err
	}
	return user, nil
}

func UpdateUserPw(userId int64, userPw string) error {
	commandTag, err := db.Exec(dbContext, "UPDATE users SET password_hash = $1 WHERE user_id = $2", userPw, userId)
	if err != nil {
		return err
	} else if commandTag.RowsAffected() != 1 {
		return errors.New("Error updating user password at DB")
		// utils.Log.Println("db error: Error updating user password at DB")
	}
	return nil
}

func UserContacts(userId int64) ([]types.Contact, error) {
	var contacts []types.Contact
	rows, err := db.Query(dbContext, `SELECT users.user_id, users.name, users.profile_pic FROM users
										JOIN user_contact 
										ON users.user_id = user_contact.user_1_id AND user_contact.user_2_id = $1
										OR users.user_id = user_contact.user_2_id AND user_contact.user_1_id = $1`, userId)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var contact types.Contact
		err := rows.Scan(&contact.UserId, &contact.Name, &contact.Profile_Pic)
		if err != nil {
			return nil, err
		}
		contacts = append(contacts, contact)
	}
	return contacts, nil
}

func ContactExists(userId int64, contactId int64) bool {
	var exists bool
	row := db.QueryRow(dbContext, `SELECT EXISTS(SELECT * FROM user_contact 
									WHERE user_1_id = $1 AND user_2_id = $2)`, userId, contactId)
	err := row.Scan(&exists)
	if err != nil {
		// utils.Log.Println("db error: Error checking if contact exists at DB")
		return false
	}
	return exists
}

func ContactMsgs(userId int64, contactId int64, offset int) ([]types.Message, error) {
	var messages []types.Message
	rows, err := db.Query(dbContext, `SELECT * FROM message WHERE
										msg_from = $1 AND msg_to = $2
										OR msg_from = $2 AND msg_to = $1
										ORDER BY time DESC OFFSET $3 LIMIT 10`, userId, contactId, offset)
	// rows, err := db.Query(dbContext, `SELECT * FROM message WHERE
	// 									msg_from = $1 AND msg_to = $2
	// 									OR msg_from = $2 AND msg_to = $1`, userId, contactId)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var message types.Message
		err := rows.Scan(&message.MessageId, &message.From, &message.To, &message.Text, &message.Time)
		if err != nil {
			return nil, err
		}
		// fmt.Println("messagedb", message)
		messages = append(messages, message)
	}
	return messages, nil
}

func AddContact(userId1 int64, userId2 int64) error {
	commandTag, err := db.Exec(dbContext, `INSERT INTO user_contact (user_1_id, user_2_id) 
											VALUES ($1, $2)`, userId1, userId2)
	if err != nil {
		return err
	} else if commandTag.RowsAffected() != 1 {
		return errors.New("Error inserting new contact at DB")
	}
	return nil
}

func InsertMessage(insertMessage types.WsMessage) (types.Message, error) {
	var message types.Message
	row := db.QueryRow(dbContext, "INSERT INTO message (msg_from, msg_to, text) VALUES ($1, $2, $3) RETURNING *", insertMessage.From, insertMessage.To, insertMessage.Text)
	err := row.Scan(&message.MessageId, &message.From, &message.To, &message.Text, &message.Time)
	if err != nil {
		return message, err
	}
	// fmt.Println(message)
	return message, nil
}

func UpdateLastSeen(userId int64, time time.Time) error {
	commandTag, err := db.Exec(dbContext, "UPDATE users SET last_seen = $1 WHERE user_id = $2", time, userId)
	if err != nil {
		return err
	} else if commandTag.RowsAffected() != 1 {
		return errors.New("Error updating user last seen at DB")
	}
	return nil
}

func GetUserLastSeen(userId int64) (types.UserLastSeen, error) {
	row := db.QueryRow(dbContext, "SELECT date_trunc('second', last_seen) FROM users WHERE user_id = $1", userId)
	var resultTime types.UserLastSeen
	err := row.Scan(&resultTime.UserLastSeenTime)
	if err != nil {
		return resultTime, err
	}
	return resultTime, nil
}

// type dbStruct struct {
// 	db        pgx.Conn
// 	dbContext context.Context
// }

// type Person struct {
// 	Name  string `json:"name,omitempty"`
// 	Phone int    `json:"phone,omitempty"`
// }

// type dbMethods interface {
// 	SelectRow() Person
// 	SelectRows() pgx.Rows
// }

// func (db dbStruct) DbConnect() pgx.Conn {
// 	dbConn, err := pgx.Connect(db.dbContext, dbUrl)
// 	if err != nil {
// 		log.Fatal("Unable to connect to database: ", err.Error())
// 	}
// 	fmt.Println("Connected to database")
// 	return *dbConn
// }

// func (dbInstance dbStruct) DbClose() {
// 	dbInstance.db.Close(dbInstance.dbContext)
// }

// func (dbInstance dbStruct) SelectRow(id int) Person {
// 	var person = Person{}
// 	dbInstance.db.QueryRow(dbInstance.dbContext, "SELECT name, phone FROM test WHERE t_id = $1", id).Scan(&person.Name, &person.Phone)
// 	return person
// }
