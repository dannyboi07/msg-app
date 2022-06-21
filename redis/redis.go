package redis

import (
	"context"
	"fmt"
	"strconv"

	"github.com/go-redis/redis/v9"
)

var ctx context.Context
var redisClient *redis.Client

func InitRedis() {
	ctx = context.Background()
	redisClient = redis.NewClient(&redis.Options{
		Addr:        "localhost:6379",
		Password:    "",
		DB:          0,
		ReadTimeout: -1,
	})
	fmt.Println("Intialized Redis connection")
	// err = redisClient.Set(ctx, "dummykey", "dummyval", 0).Err()
}

func PingRedis() {
	pong, err := redisClient.Ping(ctx).Result()
	fmt.Println(pong, err)
}

func SetUOnline(userId int64) error {
	// jsonValue, err := json.Marshal(value)
	// if err != nil {
	// 	fmt.Println("Error marshalling for redis")
	// 	return err
	// }
	err := redisClient.Set(ctx, strconv.Itoa(int(userId)), "Online", 0).Err()
	if err != nil {
		fmt.Println("Error setting key-val in Redis")
		return err
	}
	err = redisClient.Publish(ctx, fmt.Sprintf("userstatus %d", userId), "Online").Err()
	if err != nil {
		fmt.Println("Error publishing user online in Redis")
		// return err
	}
	return nil
}

func SetUOffline(userId int64, time string) {
	err := redisClient.Set(ctx, strconv.Itoa(int(userId)), time, 0).Err()
	if err != nil {
		fmt.Println("Error deleting user status from Redis")
	}
	err = redisClient.Publish(ctx, fmt.Sprintf("userstatus %d", userId), time).Err()
	if err != nil {
		fmt.Println("Error publishing user last seen timestamp in Redis")
	}
}

func CheckUStatus(userId int64) (string, error) {
	// existsInt, err := redisClient.Get(ctx, strconv.Itoa(int(userId))).Result()
	// if err != nil {
	// 	fmt.Println("Error getting user status from Redis", err)
	// }
	// if existsInt == 0 {
	// 	return false
	// }
	// return true
	lastSeen, err := redisClient.Get(ctx, strconv.Itoa(int(userId))).Result()
	if err != nil {
		fmt.Println("Error getting user's status")
		return "", err
	}
	return lastSeen, nil
}

func IsUserOnline(userId int64) bool {
	existsInt := redisClient.Exists(ctx, strconv.Itoa(int(userId))).Val()
	// if err != nil {
	// 	fmt.Println("Error checking user is on/offline in Redis")
	// }
	if existsInt == 0 {
		return false
	}
	return true
}

func SubUserStatus(userId int64) *redis.PubSub {
	pubsub := redisClient.Subscribe(ctx, fmt.Sprintf("userstatus %d", userId))
	return pubsub
}

func PubSubWait(pubsub *redis.PubSub) error {
	if _, err := pubsub.Receive(ctx); err != nil {
		return err
	}
	return nil
}

// func UnSubUserStatus(userId int64, )
