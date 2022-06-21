package types

type Person struct {
	Name  *string `json:"name,omitempty"`
	Phone *int    `json:"phone,omitempty"`
}
