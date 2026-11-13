package com.isellastore.member.dto;

import com.isellastore.member.domain.Member;

import java.util.ArrayList;
import java.util.List;

/** 화면에 내려주는 회원 정보 (비밀번호 해시 등 내부 값은 절대 포함하지 않는다) */
public record MemberView(Long id, String email, String nickname, String avatarUrl, List<String> providers, String role) {

    public static MemberView of(Member m) {
        List<String> providers = new ArrayList<>();
        if (m.getPasswordHash() != null) providers.add("password");
        // 소셜 연결(member_identity)은 SSO 단계에서 추가
        return new MemberView(m.getId(), m.getEmail(), m.getNickname(), m.getAvatarUrl(), providers, m.getRole());
    }
}
