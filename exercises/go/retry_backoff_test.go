package exercises

import (
	"errors"
	"testing"
	"time"
)

type RetryConfig struct {
	MaxRetries int
	BaseDelay  time.Duration
}

func WithRetry(cfg RetryConfig, fn func() error) (int, error) {
	var lastErr error
	for attempt := 0; attempt <= cfg.MaxRetries; attempt++ {
		lastErr = fn()
		if lastErr == nil {
			return attempt + 1, nil
		}
		if attempt < cfg.MaxRetries {
			delay := cfg.BaseDelay * (1 << attempt)
			time.Sleep(delay)
		}
	}
	return cfg.MaxRetries + 1, lastErr
}

func TestRetrySucceedsFirst(t *testing.T) {
	attempts, err := WithRetry(RetryConfig{MaxRetries: 3, BaseDelay: time.Millisecond}, func() error {
		return nil
	})
	if err != nil || attempts != 1 {
		t.Errorf("expected 1 attempt with no error, got %d attempts, err=%v", attempts, err)
	}
}

func TestRetrySucceedsAfterFailures(t *testing.T) {
	count := 0
	attempts, err := WithRetry(RetryConfig{MaxRetries: 5, BaseDelay: time.Millisecond}, func() error {
		count++
		if count < 3 {
			return errors.New("transient")
		}
		return nil
	})
	if err != nil {
		t.Errorf("should succeed, got %v", err)
	}
	if attempts != 3 {
		t.Errorf("expected 3 attempts, got %d", attempts)
	}
}

func TestRetryExhausted(t *testing.T) {
	_, err := WithRetry(RetryConfig{MaxRetries: 2, BaseDelay: time.Millisecond}, func() error {
		return errors.New("permanent")
	})
	if err == nil {
		t.Error("should return error after exhausting retries")
	}
}

func TestRetryExponentialBackoff(t *testing.T) {
	cfg := RetryConfig{MaxRetries: 3, BaseDelay: 5 * time.Millisecond}
	start := time.Now()
	WithRetry(cfg, func() error { return errors.New("fail") })
	elapsed := time.Since(start)
	// 5ms + 10ms + 20ms = 35ms minimum
	if elapsed < 30*time.Millisecond {
		t.Errorf("expected at least 30ms of backoff, got %v", elapsed)
	}
}
