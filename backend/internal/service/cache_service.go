package service

import (
	"context"
	"time"
	"github.com/redis/go-redis/v9"
)

type CacheService interface {
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Get(ctx context.Context, key string, dest interface{}) error
	Delete(ctx context.Context, key string) error
}

type RedisCacheService struct {
	client *redis.Client
}

func NewRedisCacheService(ctx context.Context, addr string) *RedisCacheService {
	opt, err := redis.ParseURL(addr)
	if err != nil {
		// Fallback: treat as plain host:port
		opt = &redis.Options{Addr: addr}
	}
	rdb := redis.NewClient(opt)

	// Check connection
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil
	}

	return &RedisCacheService{client: rdb}
}

func (s *RedisCacheService) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	if s == nil || s.client == nil {
		return nil
	}
	return s.client.Set(ctx, key, value, expiration).Err()
}

func (s *RedisCacheService) Get(ctx context.Context, key string, dest interface{}) error {
	if s == nil || s.client == nil {
		return redis.Nil
	}
	return s.client.Get(ctx, key).Scan(dest)
}

func (s *RedisCacheService) Delete(ctx context.Context, key string) error {
	if s == nil || s.client == nil {
		return nil
	}
	return s.client.Del(ctx, key).Err()
}
