package com.isellastore.member.service;

import com.isellastore.global.error.ApiException;
import com.isellastore.member.domain.Member;
import com.isellastore.member.dto.LoginForm;
import com.isellastore.member.dto.SignupForm;
import com.isellastore.member.repository.MemberRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder.SecretKeyFactoryAlgorithm;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

/**
 * 이메일 가입·로그인.
 *
 * 비밀번호 해시: PBKDF2-HMAC-SHA256, 60만 회 (OWASP Password Storage Cheat Sheet 권장값).
 * BCrypt 는 72바이트를 넘는 입력을 거부하므로(긴 한글 문장 비밀번호와 충돌) 쓰지 않는다.
 * 저장값 앞에 {pbkdf2} 표시가 붙어, 나중에 방식을 바꿔도 기존 회원이 그대로 로그인된다.
 */
@Service
public class MemberAuthService {

    private static final java.util.regex.Pattern NICKNAME = java.util.regex.Pattern.compile("^[\\p{IsHangul}A-Za-z0-9_]{2,20}$");
    private static final String BAD_CREDENTIALS = "이메일 또는 비밀번호가 맞지 않습니다";

    private final MemberRepository members;
    private final LoginAttemptGuard guard;
    private final NicknameGenerator nicknames;
    private final PasswordEncoder encoder;
    /** 없는 이메일로 로그인해도 같은 시간이 걸리게 비교할 가짜 해시 (가입 여부 노출 방지) */
    private final String dummyHash;

    public MemberAuthService(MemberRepository members, LoginAttemptGuard guard, NicknameGenerator nicknames) {
        this.members = members;
        this.guard = guard;
        this.nicknames = nicknames;
        Pbkdf2PasswordEncoder pbkdf2 = new Pbkdf2PasswordEncoder("", 16, 600_000, SecretKeyFactoryAlgorithm.PBKDF2WithHmacSHA256);
        this.encoder = new DelegatingPasswordEncoder("pbkdf2", Map.of("pbkdf2", pbkdf2));
        this.dummyHash = encoder.encode("dummy-password-for-timing");
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public Member signup(SignupForm form) {
        String email = normalizeEmail(form.email());
        if (members.existsByEmail(email)) {
            throw ApiException.conflict("이미 가입된 이메일입니다");
        }
        String lang = "en".equals(form.lang()) ? "en" : "ko";
        String nickname = form.nickname() == null || form.nickname().isBlank()
                ? nicknames.generate(lang, members::existsByNickname)
                : requireAvailable(form.nickname());
        Member member = new Member(email, nickname, encoder.encode(form.password()), lang);
        member.recordLogin();
        try {
            return members.saveAndFlush(member);
        } catch (DataIntegrityViolationException e) {
            // 동시에 같은 이메일(또는 같은 닉네임)으로 가입이 겹친 드문 경우
            if (members.existsByEmail(email)) throw ApiException.conflict("이미 가입된 이메일입니다");
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "잠시 후 다시 시도해 주세요");
        }
    }

    @Transactional
    public Member login(LoginForm form) {
        String email = normalizeEmail(form.email());
        if (guard.isBlocked(email)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.");
        }
        Member member = members.findByEmail(email).orElse(null);
        String hash = member != null && member.getPasswordHash() != null ? member.getPasswordHash() : dummyHash;
        boolean ok = encoder.matches(form.password(), hash) && member != null && member.getPasswordHash() != null;
        if (!ok) {
            guard.recordFailure(email);
            throw new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS);
        }
        guard.reset(email);
        member.recordLogin();
        return member;
    }

    public enum NicknameStatus { AVAILABLE, INVALID, TAKEN }

    /** 가입 화면에 미리 채워 줄 추천 닉네임 (지금 이 순간 아무도 안 쓰는 것) */
    @Transactional(readOnly = true)
    public String suggestNickname(String lang) {
        return nicknames.generate("en".equals(lang) ? "en" : "ko", members::existsByNickname);
    }

    /** 중복 확인 (가입·변경 화면에서 입력하는 동안 호출) */
    @Transactional(readOnly = true)
    public NicknameStatus checkNickname(String raw) {
        String nickname = raw == null ? "" : raw.strip();
        if (!NICKNAME.matcher(nickname).matches()) return NicknameStatus.INVALID;
        return members.existsByNickname(nickname) ? NicknameStatus.TAKEN : NicknameStatus.AVAILABLE;
    }

    private String requireAvailable(String raw) {
        String nickname = raw.strip();
        switch (checkNickname(nickname)) {
            case INVALID -> throw ApiException.badRequest("닉네임은 2~20자의 한글·영문·숫자·밑줄(_)만 쓸 수 있습니다");
            case TAKEN -> throw ApiException.conflict("이미 쓰고 있는 닉네임입니다");
            default -> { return nickname; }
        }
    }

    /** 닉네임 변경: 2~20자, 한글·영문·숫자·밑줄. 다른 회원이 쓰는 닉네임이면 409 */
    @Transactional
    public Member changeNickname(Long memberId, String raw) {
        Member member = find(memberId);
        if (member == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다");
        String nickname = raw == null ? "" : raw.strip();
        if (!NICKNAME.matcher(nickname).matches()) {
            throw ApiException.badRequest("닉네임은 2~20자의 한글·영문·숫자·밑줄(_)만 쓸 수 있습니다");
        }
        if (nickname.equals(member.getNickname())) return member;
        if (members.existsByNickname(nickname)) throw ApiException.conflict("이미 쓰고 있는 닉네임입니다");
        member.changeNickname(nickname);
        try {
            return members.saveAndFlush(member);
        } catch (DataIntegrityViolationException e) {
            throw ApiException.conflict("이미 쓰고 있는 닉네임입니다");
        }
    }

    @Transactional(readOnly = true)
    public Member find(Long id) {
        return id == null ? null : members.findById(id).orElse(null);
    }
}
