package com.example.demo.security.ratelimit;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class InMemoryRateLimiter {
    private final ConcurrentHashMap<String, RequestData> requestCounts = new ConcurrentHashMap<>();
    private final int MAX_REQUESTS_PER_MINUTE = 10;

    private static class RequestData {
        AtomicInteger count;
        long windowStartTime;

        RequestData(int count, long windowStartTime) {
            this.count = new AtomicInteger(count);
            this.windowStartTime = windowStartTime;
        }
    }

    public boolean tryConsume(String ip) {
        long now = System.currentTimeMillis();
        if (Math.random() < 0.01) { 
            cleanUp(now);
        }

        RequestData data = requestCounts.compute(ip, (key, val) -> {
            if (val == null || (now - val.windowStartTime) > 60000) {
                return new RequestData(1, now);
            }
            val.count.incrementAndGet();
            return val;
        });

        return data.count.get() <= MAX_REQUESTS_PER_MINUTE;
    }
    
    public long getRetryAfterSeconds(String ip) {
        RequestData data = requestCounts.get(ip);
        if (data == null) return 0;
        long now = System.currentTimeMillis();
        long elapsed = now - data.windowStartTime;
        if (elapsed > 60000) return 0;
        return (60000 - elapsed) / 1000;
    }

    private void cleanUp(long now) {
        requestCounts.entrySet().removeIf(entry -> (now - entry.getValue().windowStartTime) > 60000);
    }
}
