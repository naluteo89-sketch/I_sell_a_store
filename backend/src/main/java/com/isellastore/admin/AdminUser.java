package com.isellastore.admin;

import jakarta.persistence.*;

import java.time.Instant;

/** 관리자 계정. 비밀번호는 BCrypt 해시로만 저장한다 (로그인 기능은 보안 작업에서 연결). */
@Entity
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String role = "ADMIN";

    private boolean enabled = true;

    private Instant createdAt = Instant.now();

    private Instant lastLoginAt;

    protected AdminUser() {}

    public AdminUser(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
    }

    public void recordLogin() { this.lastLoginAt = Instant.now(); }
    public void changePasswordHash(String hash) { this.passwordHash = hash; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastLoginAt() { return lastLoginAt; }
}
