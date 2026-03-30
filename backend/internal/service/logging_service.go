package service

import (
	"context"
	"time"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AdminLog struct {
	UserID    string      `json:"user_id" bson:"user_id"`
	Action    string      `json:"action" bson:"action"`
	Metadata  interface{} `json:"metadata" bson:"metadata"`
	Timestamp time.Time   `json:"timestamp" bson:"timestamp"`
}

type LoggingService interface {
	LogAction(ctx context.Context, log AdminLog) error
	GetLogs(ctx context.Context, limit int) ([]AdminLog, error)
}

type MongoLoggingService struct {
	collection *mongo.Collection
}

func NewMongoLoggingService(uri string) (*MongoLoggingService, error) {
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, err
	}
	
	collection := client.Database("skillfest").Collection("admin_logs")
	return &MongoLoggingService{collection: collection}, nil
}

func (s *MongoLoggingService) LogAction(ctx context.Context, log AdminLog) error {
	log.Timestamp = time.Now()
	_, err := s.collection.InsertOne(ctx, log)
	return err
}

func (s *MongoLoggingService) GetLogs(ctx context.Context, limit int) ([]AdminLog, error) {
	opts := options.Find().SetLimit(int64(limit)).SetSort(map[string]interface{}{"timestamp": -1})
	cursor, err := s.collection.Find(ctx, map[string]interface{}{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []AdminLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}
	return logs, nil
}
