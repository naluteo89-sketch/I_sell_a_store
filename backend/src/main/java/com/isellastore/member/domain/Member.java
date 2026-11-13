package com.isellastore.member.domain;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * 쇼핑몰 회원 (관리자 admin_user 와 별개).
 * 비밀번호는 해시로만 저장하고, 소셜 전용 회원은 passwordHash 가 null 이다.
 */
@Entity
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 소문자·앞뒤 공백 제거 후 저장 (같은 주소를 대소문자만 바꿔 두 번 가입하지 못하게) */
    @Column(nullable = false, unique = true, length = 254)
    private String email;

    /** 가입 때 자동으로 만든 겹치지 않는 닉네임 (예: 포근한고래4821) */
    @Column(nullable = false, unique = true, length = 30)
    private String nickname;

    @Column(length = 200)
    private String passwordHash;

    @Column(length = 500)
    private String avatarUrl;

    @Column(nullable = false, length = 10)
    private String role = "USER";

    @Column(nullable = false, length = 5)
    private String lang = "ko";

    private Instant privacyAgreedAt;

    private Instant createdAt = Instant.now();

    private Instant lastLoginAt;

    protected Member() {}

    public Member(String email, String nickname, String passwordHash, String lang) {
        this.email = email;
        this.nickname = nickname;
        this.passwordHash = passwordHash;
        this.lang = lang;
        this.privacyAgreedAt = Instant.now();
    }

    public void recordLogin() { this.lastLoginAt = Instant.now(); }
    public void changeNickname(String nickname) { this.nickname = nickname; }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNickname() { return nickname; }
    public String getPasswordHash() { return passwordHash; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getRole() { return role; }
    public String getLang() { return lang; }
    public Instant getPrivacyAgreedAt() { return privacyAgreedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastLoginAt() { return lastLoginAt; }
}
