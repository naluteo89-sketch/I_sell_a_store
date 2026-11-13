package com.isellastore.member.service;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 같은 이메일로 짧은 시간에 로그인 실패가 몰리면 잠시 막는다 (비밀번호 대입 공격 완화).
 * 메모리 보관이라 서버를 재시작하면 초기화된다 — 서버가 여러 대가 되면 Redis 등으로 옮긴다.
 */
@Component
public class LoginAttemptGuard {

    static final int MAX_FAILURES = 10;
    static final Duration WINDOW = Duration.ofMinutes(5);

    private final Map<String, Deque<Long>> failures = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Deque<Long> q = failures.get(key);
        if (q == null) return false;
        synchronized (q) {
            prune(q);
            return q.size() >= MAX_FAILURES;
        }
    }

    public void recordFailure(String key) {
        Deque<Long> q = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            prune(q);
            q.addLast(System.currentTimeMillis());
        }
    }

    public void reset(String key) {
        failures.remove(key);
    }

    private static void prune(Deque<Long> q) {
        long cutoff = System.currentTimeMillis() - WINDOW.toMillis();
        while (!q.isEmpty() && q.peekFirst() < cutoff) q.pollFirst();
    }
}
