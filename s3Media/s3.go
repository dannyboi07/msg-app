package s3Media

import (
	"fmt"
	"mime/multipart"
	"msg-app/backend/utils"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

// var profImgUpParams = &s3manager.UploadInput{
// 	Bucket: aws.String(os.Getenv("S3_PROF_IMG_BUCK")),
// }

var sess *session.Session
var getObjSess *s3.S3

// var sess = session.Must(session.NewSession(&aws.Config{
// 	Region:      aws.String(os.Getenv("AWS_REGION")),
// 	Credentials: credentials.NewStaticCredentials(*aws.String(os.Getenv("AWS_ACCESS_KEY_ID")), *aws.String(os.Getenv("AWS_SECRET_KEY")), ""),
// }))

var uploader *s3manager.Uploader
var bucket string

func InitS3() {
	bucket = *aws.String(os.Getenv("S3_BUCKET"))
	sess = session.Must(session.NewSession(&aws.Config{
		Region:      aws.String(os.Getenv("AWS_REGION")),
		Credentials: credentials.NewStaticCredentials(*aws.String(os.Getenv("AWS_ACCESS_KEY_ID")), *aws.String(os.Getenv("AWS_SECRET_KEY")), ""),
	}))
	getObjSess = s3.New(session.New())
	uploader = s3manager.NewUploader(sess)
}

func S3UploadImage(fileBody *multipart.Part, key string) error {

	utils.Log.Println("key", key, "filebody", fileBody, "filebody map", fileBody)
	result, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: &bucket,
		Key:    aws.String(key),
		Body:   fileBody,
	}) // 1657312400-oJnNPGsiuzytMOJPatwtPilfsfykSBGplhxtxVSGpqaJaBRgAv.png
	// if err != nil {
	// 	utils.Log.Println("error uploading profimg to s3")
	// 	return err
	// }
	fmt.Println("s3 result", result)
	return err
}

func GetS3Img(key string) (*s3.GetObjectOutput, string, int) {
	input := &s3.GetObjectInput{
		Bucket: &bucket,
		Key:    aws.String(key),
	}

	result, err := getObjSess.GetObject(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case s3.ErrCodeNoSuchKey:
				utils.Log.Println(s3.ErrCodeNoSuchKey, aerr.Error())
				return nil, "Image not found", http.StatusNotFound
			case s3.ErrCodeInvalidObjectState:
				utils.Log.Println(s3.ErrCodeInvalidObjectState, aerr.Error())
				return nil, "Interval server error", http.StatusInternalServerError
			default:
				utils.Log.Println(aerr.Error())
				return nil, "Interval server error", http.StatusInternalServerError
			}
		}
	} else {
		utils.Log.Println(err)
		return nil, "Interval server error", http.StatusInternalServerError
	}
	utils.Log.Println("result", result)
	return result, "", 0
}
