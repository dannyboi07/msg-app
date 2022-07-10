module msg-app/backend

go 1.18

require (
	github.com/gabriel-vasile/mimetype v1.4.0
	github.com/go-chi/chi/v5 v5.0.7
)

require (
	github.com/aws/aws-sdk-go v1.44.50
	github.com/go-chi/cors v1.2.1
	github.com/go-redis/redis/v9 v9.0.0-beta.1
	github.com/gorilla/websocket v1.5.0
	github.com/jackc/pgx/v4 v4.16.1
	github.com/joho/godotenv v1.4.0
	golang.org/x/crypto v0.0.0-20211209193657-4570a0811e8b
)

require (
	github.com/cespare/xxhash/v2 v2.1.2 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
)

require (
	github.com/golang-jwt/jwt/v4 v4.4.1
	github.com/jackc/chunkreader/v2 v2.0.1 // indirect
	github.com/jackc/pgconn v1.12.1 // indirect
	github.com/jackc/pgio v1.0.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgproto3/v2 v2.3.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20200714003250-2b9c44734f2b // indirect
	github.com/jackc/pgtype v1.11.0 // indirect
	github.com/jackc/puddle v1.2.2-0.20220404125616-4e959849469a // indirect
	golang.org/x/net v0.0.0-20220225172249-27dd8689420f // indirect
	golang.org/x/text v0.3.7 // indirect
	gopkg.in/yaml.v3 v3.0.0-20210107192922-496545a6307b // indirect
)

// replace msg-backend/db => ./db

// replace msg-backend/controller => ./controller
